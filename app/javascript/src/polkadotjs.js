// === NIGHTLY ===
import { NightlyConnectAdapter } from "@nightlylabs/wallet-selector-polkadot";

// === POLKADOT ===
import { ApiPromise, WsProvider } from "@polkadot/api";
import { ContractPromise } from "@polkadot/api-contract";
import { web3Accounts, web3Enable } from "@polkadot/extension-dapp";
import { BN, bnToBn, hexToU8a, isHex, stringCamelCase } from "@polkadot/util";
import { decodeAddress, encodeAddress } from "@polkadot/keyring";

// === USE INKATHON ===
import {
  contractCallDryRun,
  contractQuery,
  decodeOutput,
  getBalance,
} from "@scio-labs/use-inkathon";

// === CUSTOM ===
import { HELPERS } from "../application";

export const POLKADOTJS = {
  adapter: undefined,
  connectButtonSelector: ".polkadot-connect-button",
  maxU128: "340282366920938463463374607431768211454",
  ApiPromise,
  BN,
  // https://polkadot.js.org/docs/extension/usage/
  connectPolkadotjsExtension: async () => {
    HELPERS.button.disable(POLKADOTJS.connectButtonSelector);
    // returns an array of all the injected sources
    // (this needs to be called first, before other requests)
    // this call fires up the authorization popup
    try {
      POLKADOTJS.adapter = await NightlyConnectAdapter.build(
        {
          appMetadata: {
            name: "Smart Contract Hub",
            description:
              "Find and share smart contract metadata on Aleph Zero and Aleph Zero Testnet.",
            icon: "https://docs.nightly.app/img/logo.png",
            // additionalInfo: 'Courtesy of Nightly Connect team'
          },
          network: "AlephZero",
          //   persistent: false  -  Add this if you want to make the session non-persistent
        },
        // { initOnConnect: true, disableModal: true, disableEagerConnect: true }  -  You may specify the connection options object here
        // document.getElementById("modalAnchor")  -  You can pass an optional anchor element for the modal here
      );
      // Trigger connection
      await POLKADOTJS.adapter.connect();
      const accounts = await POLKADOTJS.adapter.accounts.get();
      POLKADOTJS.initAccountList(accounts);
      return { accounts };
    } catch (err) {
      document.showAlertDanger(err);
      HELPERS.button.enable(POLKADOTJS.connectButtonSelector);
    }
  },
  contractCallDryRun,
  ContractPromise,
  contractQuery,
  // Monkey patch in a monkey patch
  contractTx: async (
    api,
    account,
    contract,
    method,
    options = {},
    args = [],
    statusCb = undefined
  ) => {
    try {
      // Check if account has sufficient balance
      const accountAddress =
        typeof account === "string" ? account : account.address;
      const { freeBalance } = await getBalance(api, accountAddress);
      const hasZeroBalance = !freeBalance || freeBalance.isZero();
      const hasBalanceBelowPassedValue =
        options?.value && freeBalance && freeBalance.lte(bnToBn(options.value));
      if (hasZeroBalance || hasBalanceBelowPassedValue) {
        return Promise.reject({
          errorMessage: "TokenBelowMinimum",
        });
      }

      // Dry run to determine required gas and potential errors
      delete options.gasLimit;
      const dryResult = await contractCallDryRun(
        api,
        account,
        contract,
        method,
        options,
        args
      );
      const { isError, decodedOutput } = decodeOutput(
        dryResult,
        contract,
        method
      );
      if (isError)
        return Promise.reject({
          dryResult,
          errorMessage: decodedOutput || "Error",
        });

      // Call actual query/tx & wrap it in a promise
      const gasLimit = dryResult.gasRequired;
      return new Promise(async (resolve, reject) => {
        try {
          const isDevelopment =
            (api.runtimeChain || "").toLowerCase() === "development"
              ? "isInBlock"
              : "isFinalized";
          const finalStatus = isDevelopment ? "isInBlock" : "isFinalized";
          const asFinalStatus = isDevelopment ? "asInBlock" : "asFinalized";

          const tx = contract.tx[stringCamelCase(method)](
            { ...options, gasLimit },
            ...args
          );

          const unsub = await tx.signAndSend(account, async (result) => {
            result.options = options;
            statusCb?.(result);

            const isFinalized = result?.status?.[finalStatus];
            if (!isFinalized) return;

            // Determine extrinsic and block info
            const extrinsicHash = result.txHash.toHex();
            const extrinsicIndex = result.txIndex;
            const blockHash = result.status[asFinalStatus].toHex();

            const errorEvent = result?.events.find(({ event }) =>
              api.events.system.ExtrinsicFailed.is(event)
            );
            if (errorEvent) {
              // Reject if `ExtrinsicFailed` event was found
              reject({
                dryResult,
                errorMessage: decodeOutput || "ExtrinsicFailed",
                errorEvent,
                extrinsicHash,
                extrinsicIndex,
                blockHash,
              });
              unsub?.();
            } else {
              // Resolve succesfully otherwise
              const successEvent = result?.events.find(({ event }) =>
                api.events.system.ExtrinsicSuccess.is(event)
              );

              resolve({
                decodedOutput,
                dryResult,
                result,
                successEvent,
                extrinsicHash,
                extrinsicIndex,
                blockHash,
              });
              unsub?.();
            }
          });
        } catch (e) {
          let errorMessage = "Error";

          if (e?.message?.match(/user reject request/i)) {
            errorMessage = "UserCancelled";
          }

          const errorText = e?.toString?.();
          const rpcErrorCode =
            errorText && typeof errorText === "string"
              ? errorText.match(/RpcError: (\d+):/i)?.[1]
              : null;
          switch (rpcErrorCode) {
            case "1010":
              errorMessage = "TokenBelowMinimum";
              break;
            default:
              break;
          }

          reject({ errorMessage });
        }
      });
    } catch (err) {
      if (typeof err.errorMessage == "string") {
        throw err;
      }

      let decodeOutput = err.errorMessage;
      let result = await contractCallDryRun(
        api,
        account,
        contract,
        method,
        options,
        args
      );
      const { isError, decodedOutput } = decodeOutput(result, contract, method);
      if (isError) {
        return Promise.reject({
          result,
          errorMessage: decodedOutput || "Error",
        });
      }
    }
  },
  getBalance,
  humanizeStringNumberFromSmartContract: (number, decimals) => {
    return document.humanizeStringNumberFromSmartContract(
      document.formatHumanizedNumberForSmartContract(number, 0),
      decimals
    );
  },
  initAccountList: (accounts) => {
    $("#polkadot-account-list .list-group").html("");
    _.sortBy(accounts, ["name"]).forEach(function (account) {
      // https://themesbrand.com/velzon/html/saas/ui-lists.html#
      $("#polkadot-account-list .list-group").append(
        `<a href="javascript:void(0);" class="d-flex align-items-center border-0 list-group-item list-group-item-action px-0" data-account-address= '${account.address}', data-account-name='${account.name}', data-account-source='${POLKADOTJS.adapter.selectedWallet.name}'><div class='text-center me-3 logo-container'><img class="h-100" src='${POLKADOTJS.adapter.selectedWallet.image.default}'></div><div class="flex-fill"><h5 class="list-title mb-1">${account.name}</h5><h7 class="mb-0 list-subtitle">${account.address}</h7></div></a>`,
      );
    });
    // Enable clicking change button
    $("#change-account-link").click(function (e) {
      e.preventDefault();
      $("#polkadot-account-list").modal("show");
    });
  },
  listenForAccountSelect: function (scope) {
    $("#polkadot-account-list [data-account-address]").on(
      "click",
      function (e) {
        e.preventDefault();
        $("#polkadot-account-list").modal("hide");
        scope.updateAfterAccountSelect(e);
      }
    );
  },
  listenForConnectButtonClick: (scope) => {
    if ($(".polkadotjs").length) {
      $(POLKADOTJS.connectButtonSelector).removeClass("d-none");
      document
        .querySelectorAll(POLKADOTJS.connectButtonSelector)
        .forEach((item) => {
          item.addEventListener("click", async () => {
            await scope.activatePolkadotJsExtension();
          });
        });
    }
  },
  // https://polkadot.js.org/docs/util-crypto/examples/validate-address
  validateAddress: function (address) {
    try {
      encodeAddress(
        isHex(address) ? hexToU8a(address) : decodeAddress(address)
      );
      return true;
    } catch (error) {
      return false;
    }
  },
  web3Accounts,
  WsProvider,
};
