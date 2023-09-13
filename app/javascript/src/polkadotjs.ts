import _ from "lodash";

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
import { IKeyringPair } from "@polkadot/types/types";

export const POLKADOTJS = {
  maxU128: "340282366920938463463374607431768211454",
  // https://polkadot.js.org/docs/extension/usage/
  activatePolkadotjsExtension: async () => {
    if ($(".polkadotjs").length) {
      let polkadotConnectButtonSelector = ".polkadot-connect-button";
      $(polkadotConnectButtonSelector).removeClass("d-none");
      document
        .querySelectorAll(polkadotConnectButtonSelector)
        .forEach((item) => {
          item.addEventListener("click", async (_evt) => {
            await POLKADOTJS.connectPolkadotjsExtension();
          });
        });
      return await POLKADOTJS.connectPolkadotjsExtension();
    }
  },
  ApiPromise,
  BN,
  connectPolkadotjsExtension: async () => {
    HELPERS.buttons.disable(".polkadot-connect-button");
    // returns an array of all the injected sources
    // (this needs to be called first, before other requests)
    // this call fires up the authorization popup
    try {
      const extensions = await web3Enable("Smart Contracts Hub");
      // no extension installed, or the user did not accept the authorization
      // in this case we should inform the use and give a link to the extension
      if (extensions.length === 0) {
        throw "Please install SubWallet, Polkadotjs or Talisman browser extension. If you have one of these extensions installed already, please goto the setttings and allow btn.group access.";
      }
      // returns an array of { address, meta: { name, source } }
      // meta.source contains the name of the extension that provides this account
      const allAccounts = await web3Accounts();
      POLKADOTJS.initAccountList(allAccounts);
      return {
        extensions,
        allAccounts,
      };
    } catch (err) {
      document.showAlertDanger(err);
      HELPERS.buttons.enable(".polkadot-connect-button");
    }
  },
  contractCallDryRun,
  ContractPromise,
  contractQuery,
  // Monkey patch in a monkey patch
  contractTx: async (
    api: any,
    account: string | IKeyringPair,
    contract: any,
    method: string,
    options: any = {},
    args: any[] = [],
    statusCb: (() => void) | undefined
  ): Promise<any> => {
    try {
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

      delete options.gasLimit;
      // https://github.com/scio-labs/use-inkathon/blob/580e023c9844f72993996a1c79e4f96d96240d82/src/helpers/contractCall.ts#L16
      const dryResult = await contractCallDryRun(
        api,
        account,
        contract,
        method,
        options,
        args
      );
      // This is causing a type error when attemping to decode dryResult...
      // It's expecting a ContractExecResult but it's receiving a ContractCallOutcome
      // https://github.com/polkadot-js/api/blob/700812aa6075c85d8306451ce062d8c06b161e2b/packages/types/src/interfaces/contracts/types.ts#L73
      // Thinking I may need to clean this up with: https://github.com/scio-labs/use-inkathon/blob/580e023c9844f72993996a1c79e4f96d96240d82/src/helpers/unwrapResult.ts#L6
      // https://github.com/scio-labs/use-inkathon/blob/580e023c9844f72993996a1c79e4f96d96240d82/src/helpers/decodeOutput.ts
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

          const unsub = await tx.signAndSend(account, async (result: any) => {
            result.options = options;
            statusCb?.();
            const isFinalized = result?.status?.[finalStatus];
            if (!isFinalized) return;

            const extrinsicHash = result.txHash.toHex();
            const extrinsicIndex = result.txIndex;
            const blockHash = result.status[asFinalStatus].toHex();

            const errorEvent = result?.events.find(({ event }: any) =>
              api.events.system.ExtrinsicFailed.is(event)
            );
            if (errorEvent) {
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
              const successEvent = result?.events.find(({ event }: any) =>
                api.events.system.ExtrinsicSuccess.is(event)
              );

              resolve({
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
  humanizeStringNumberFromSmartContract: (
    number: string,
    decimals: number
  ): string => {
    return HELPERS.humanizeStringNumberFromSmartContract(
      HELPERS.formatHumanizedNumberForSmartContract(number, 0),
      decimals
    );
  },
  initAccountList: (accounts: any[]) => {
    $("#polkadot-account-list .list").html("");
    _.sortBy(accounts, ["meta.source", "meta.name"]).forEach(function (
      account: any
    ) {
      $("#polkadot-account-list .list").append(
        `<li class='bg-hover-light p-0' data-account-address= '${
          account.address
        }', data-account-name= '${account.meta.name}', data-account-source= '${
          account.meta.source
        }'><a href='#' class='d-flex align-items-center'><div class='h-40px w-40px text-center me-3'><img class="h-100" src='https://res.cloudinary.com/hv5cxagki/image/upload/c_pad,dpr_2,f_auto,h_25,w_25,q_100/v1/${HELPERS.walletCloudinaryPublicId(
          account.meta.source
        )}'></div><div class="d-block"><div class="fw-bold text-gray-900">${
          account.meta.name
        }</div><div class="fs-4 text-muted fw-semibold"><div class="lh-base">${
          account.address
        }</div></div></div>`
      );
    });
  },
  listenForAccountSelect: function (scope: any) {
    $("#polkadot-account-list li").on("click", function (e: any) {
      e.preventDefault();
      $("#polkadot-account-list").modal("hide");
      scope.updateAfterAccountSelect(e);
    });
  },
  validateAddress: function (address: string) {
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
