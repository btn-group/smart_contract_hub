import { ALEPH_ZERO } from "../helpers";
import { POLKADOTJS } from "../../polkadotjs";

const SMART_CONTRACTS_NEW = {
  init: async () => {
    SMART_CONTRACTS_NEW.addListeners();
    await ALEPH_ZERO.activatePolkadotJsExtension();
  },
  addListeners: () => {
    // === FORMS ===
    document.newForm.onsubmit = async (e) => {
      e.preventDefault();
      let buttonSelector = "[name='newForm'] button[type='submit']";
      document.disableButton(buttonSelector);
      try {
        let smartContractAddress = document.newForm.smartContractAddress.value;
        let url = document.newForm.url.value;
        let api = await ALEPH_ZERO.api();
        let account = ALEPH_ZERO.account;
        api.setSigner(ALEPH_ZERO.getSigner());
        const contract = await ALEPH_ZERO.contracts[
          "azSmartContractMetadataHub"
        ].getContract();
        await POLKADOTJS.contractTx(
          api,
          account.address,
          contract,
          "create",
          {},
          [smartContractAddress, url, 0]
        );
        document.newForm.smartContractAddress.value = "";
        document.newForm.url.value = "";
        document.showAlertSuccess("Success", true);
      } catch (err) {
        document.showAlertDanger(err);
      } finally {
        document.enableButton(buttonSelector);
      }
    };
  },
};

// Even with turbo, init is called every time as listeners need to be replaced
$(document).on("turbo:load", function () {
  if ($("#smart-contracts-new").length) {
    SMART_CONTRACTS_NEW.init();
  }
});
