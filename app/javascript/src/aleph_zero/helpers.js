import { SupportedChainId, resolveAddressToDomain } from "@azns/resolver-core";
import { HELPERS } from "../../application";
import { POLKADOTJS } from "./../polkadotjs";

export const ALEPH_ZERO = {
  account: undefined,
  allAccounts: undefined,
  apisStaging: undefined,
  apisProduction: undefined,
  b3: "5HimuS19MhHX9EggD9oZzx297qt3UxEdkcc5NWAianPAQwHG",
  contracts: {
    azGroups: {
      address: (environment = "staging") => {
        if (environment == "production") {
          return "FILLTHISLATER";
        } else {
          return "5HnfHhSbMrjuZTeLhsfVwTgBahVizF2SL5vRSouat112yGYS";
        }
      },
      getContract: async (environment = "staging") => {
        let address = ALEPH_ZERO.contracts.azGroups.address(environment);
        if (!ALEPH_ZERO.contractsByAddress[address]) {
          let api = await ALEPH_ZERO.api(environment);
          let metadata = await $.ajax({
            url: "https://res.cloudinary.com/hv5cxagki/raw/upload/v1695382267/abis/aleph_zero/az_groups_lavjk6.json",
          });
          ALEPH_ZERO.contractsByAddress[address] =
            new POLKADOTJS.ContractPromise(api, metadata, address);
        }
        return ALEPH_ZERO.contractsByAddress[address];
      },
      show: async (id, environment = "staging") => {
        let contract = await ALEPH_ZERO.contracts.azGroups.getContract(
          environment
        );
        let api = await ALEPH_ZERO.api(environment);
        let response = await POLKADOTJS.contractQuery(
          api,
          ALEPH_ZERO.b3,
          contract,
          "groupsShow",
          undefined,
          [id]
        );
        return response.output.asOk.asOk.toHuman();
      },
    },
    azeroIdRouter: {
      domains: [],
      primaryDomain: undefined,
      address: (environment = "staging") => {
        if (environment == "production") {
          return "FILLTHISLATER";
        } else {
          return "5HXjj3xhtRMqRYCRaXTDcVPz3Mez2XBruyujw6UEkvn8PCiA";
        }
      },
      getContract: async (environment = "staging") => {
        let address = ALEPH_ZERO.contracts.azeroIdRouter.address(environment);
        if (!ALEPH_ZERO.contractsByAddress[address]) {
          let api = await ALEPH_ZERO.api(environment);
          let metadata = await $.ajax({
            url: "https://res.cloudinary.com/hv5cxagki/raw/upload/v1695279301/abis/aleph_zero/router_tkyoaf.json",
          });
          ALEPH_ZERO.contractsByAddress[address] =
            new POLKADOTJS.ContractPromise(api, metadata, address);
        }
        return ALEPH_ZERO.contractsByAddress[address];
      },
      getAndSetDomains: async (environment = "staging") => {
        try {
          ALEPH_ZERO.contracts.azeroIdRouter.domains = [];
          ALEPH_ZERO.contracts.azeroIdRouter.primaryDomain = undefined;
          let address = ALEPH_ZERO.account.address;
          let chainId;
          if (environment == "staging") {
            chainId = SupportedChainId.AlephZeroTestnet;
          } else {
            chainId = SupportedChainId.AlephZero;
          }
          let response = await resolveAddressToDomain(address, {
            chainId,
          });
          if (response.error) {
            throw response.error.message;
          }

          ALEPH_ZERO.contracts.azeroIdRouter.domains =
            response.allPrimaryDomains;
          ALEPH_ZERO.contracts.azeroIdRouter.primaryDomain =
            response.primaryDomain;
          console.log(ALEPH_ZERO.contracts.azeroIdRouter.domains);
        } catch (err) {
          document.showAlertDanger(err);
        }
      },
    },
    smartContractHub: {
      address: (environment = "staging") => {
        if (environment == "production") {
          return "FILLTHISLATER";
        } else {
          return "5DuSERMnVbBhZVeJSBaeUniT5BZVGhGNNf7NhyDAzioLQYhs";
        }
      },
      getContract: async (environment = "staging") => {
        let address = ALEPH_ZERO.contracts.smartContractHub.address(environment);
        if (!ALEPH_ZERO.contractsByAddress[address]) {
          let api = await ALEPH_ZERO.api(environment);
          let metadata = await $.ajax({
            url: "https://res.cloudinary.com/hv5cxagki/raw/upload/v1695379983/abis/aleph_zero/az_smart_contract_hub_pbawtd.json",
          });
          ALEPH_ZERO.contractsByAddress[address] =
            new POLKADOTJS.ContractPromise(api, metadata, address);
        }
        return ALEPH_ZERO.contractsByAddress[address];
      },
    },
  },
  contractsByAddress: {},
  extensions: undefined,
  activatePolkadotJsExtension: async () => {
    let response = await POLKADOTJS.activatePolkadotjsExtension();
    ALEPH_ZERO.extensions = response.extensions;
    ALEPH_ZERO.allAccounts = response.allAccounts;
    // Set account
    // There's three options here
    if (ALEPH_ZERO.allAccounts.length) {
      POLKADOTJS.listenForAccountSelect(ALEPH_ZERO);
      // 1. User has previously selected account and that info is stored in cookies
      if (
        HELPERS.cookies.get("polkadot_account_name") &&
        HELPERS.cookies.get("polkadot_extension")
      ) {
        ALEPH_ZERO.allAccounts.forEach(function (account) {
          if (
            account.meta.name == HELPERS.cookies.get("polkadot_account_name") &&
            account.meta.source == HELPERS.cookies.get("polkadot_extension")
          ) {
            ALEPH_ZERO.account = account;
            ALEPH_ZERO.updateAfterAccountSet();
          }
        });
      }
      if (!ALEPH_ZERO.account) {
        // 2. User has one account: Auto-select that account
        if (ALEPH_ZERO.allAccounts.length == 1) {
          ALEPH_ZERO.account = ALEPH_ZERO.allAccounts[0];
          ALEPH_ZERO.updateAfterAccountSet();
          // 3. User has multiple accounts: Show modal to select account
        } else {
          $("#polkadot-account-list").modal("show");
          document.enableButton(".polkadot-connect-button");
        }
      }
    }
  },
  // AKA API
  api: async (environment = "staging") => {
    let apis;
    let httpUrls = await ALEPH_ZERO.httpUrls(environment);
    switch (environment) {
      case "staging":
        if (!ALEPH_ZERO.apisStaging) {
          ALEPH_ZERO.apisStaging = [];
          for (const url of httpUrls) {
            let wsProvider = new POLKADOTJS.WsProvider(url);
            let c = await POLKADOTJS.ApiPromise.create({
              provider: wsProvider,
            });
            ALEPH_ZERO.apisStaging.push(c);
          }
        }
        apis = ALEPH_ZERO.apisStaging;
        break;
      default:
        if (!ALEPH_ZERO.apisProduction) {
          ALEPH_ZERO.apisProduction = [];
          for (const url of httpUrls) {
            let wsProvider = new POLKADOTJS.WsProvider(url);
            let c = await POLKADOTJS.ApiPromise.create({
              provider: wsProvider,
            });
            ALEPH_ZERO.apisProduction.push(c);
          }
        }
        while (ALEPH_ZERO.apisProduction.length == 0) {
          await document.delay(1_000);
        }
        apis = ALEPH_ZERO.apisProduction;
        break;
    }
    return _.sample(apis);
  },
  getBlockHeight: async () => {
    try {
      let api = await ALEPH_ZERO.api();
      return api.query.system.number();
    } catch (err) {
      document.showAlertDanger(err);
    }
  },
  getSigner: () => {
    let signer;
    ALEPH_ZERO.extensions.forEach(function (extension) {
      if (extension.name == ALEPH_ZERO.account.meta.source) {
        signer = extension.signer;
      }
    });
    return signer;
  },
  httpUrls: async (environment = "staging") => {
    let urls = ["wss://ws.azero.dev"];
    if (environment == "staging") {
      urls = ["wss://ws.test.azero.dev"];
    }
    return urls;
  },
  linkToExplorer: (identifier, type = "account") => {
    let link;
    link = `https://alephzero.subscan.io/${type}/${identifier}`;
    return link;
  },
  // 18th Feb 2023 - This is currently returning the wrong details.
  // metadata: async () => {
  // try {
  //   return await ALEPH_ZERO.subscan("api/scan/metadata");
  // } catch (err) {
  //   document.showAlertDanger(err);
  // }
  // },
  setUserBlockExplorerLinks: () => {
    $("#polkadot-user-menu-toggle .block-explorers").removeClass("d-none");
    let html = "";
    [["Subscan", "https://alephzero.subscan.io/account/"]].forEach(function (
      blockExplorerDetails
    ) {
      html += `<div class="menu-item px-3"><a class="menu-link px-5" href="${
        blockExplorerDetails[1] + ALEPH_ZERO.account.address
      }" target="_blank">${blockExplorerDetails[0]}</a></div>`;
    });
    $("#polkadot-user-menu-toggle .block-explorers .menu-sub").html(html);
  },
  updateAfterAccountSelect: (event) => {
    let setNewAccount = false;
    let newAddress = event.currentTarget.dataset.accountAddress;
    let newSource = event.currentTarget.dataset.accountSource;
    if (ALEPH_ZERO.account) {
      if (
        ALEPH_ZERO.account.address != newAddress ||
        ALEPH_ZERO.account.meta.source != newSource
      ) {
        setNewAccount = true;
      }
    } else {
      setNewAccount = true;
    }
    if (setNewAccount) {
      ALEPH_ZERO.allAccounts.forEach(function (account) {
        if (account.address == newAddress && account.meta.source == newSource) {
          ALEPH_ZERO.account = account;
          ALEPH_ZERO.updateAfterAccountSet();
        }
      });
    }
  },
  updateAfterAccountSet: () => {
    $("#polkadot-user-menu-toggle").removeClass("d-none");
    $("#polkadot-user-menu-toggle .wallet-address").text(
      ALEPH_ZERO.account.address
    );
    document.cookie = `polkadot_account_name=${ALEPH_ZERO.account.meta.name};`;
    document.cookie = `polkadot_extension=${ALEPH_ZERO.account.meta.source};`;
    $(".polkadot-connect-button").addClass("d-none");
    document.enableButton(".polkadot-connect-button");
    ALEPH_ZERO.setUserBlockExplorerLinks();
    HELPERS.setUserAccountMenuToggle(
      "#polkadot-user-menu-toggle",
      ALEPH_ZERO.account.address,
      ALEPH_ZERO.account.meta.name,
      ALEPH_ZERO.account.meta.source
    );
    $(document).trigger("aleph_zero_account_selected", {});
  },
};
