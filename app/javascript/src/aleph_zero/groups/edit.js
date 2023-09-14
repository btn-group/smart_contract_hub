import { ALEPH_ZERO } from "../helpers";
import { POLKADOTJS } from "../../polkadotjs";

const GROUPS_EDIT = {
  init: async () => {
    GROUPS_EDIT.addListeners();
    await ALEPH_ZERO.activatePolkadotJsExtension();
  },
  addListeners: () => {
    // === FORMS ===
    document.groupsEditForm.onsubmit = async (e) => {
      e.preventDefault();
      let buttonSelector = "[name='groupsEditForm'] button[type='submit']";
      document.disableButton(buttonSelector);
      try {
        let id = document.groupsEditForm.id.value;
        let name =
          document.groupsEditForm.name.value;
        let enabled = document.groupsEditForm.enabled.value;
        let api = await ALEPH_ZERO.api("staging");
        let account = ALEPH_ZERO.account;
        api.setSigner(ALEPH_ZERO.getSigner());
        const contract = await ALEPH_ZERO.contracts[
          "azGroups"
        ].getContract("staging");
        await POLKADOTJS.contractTx(
          api,
          account.address,
          contract,
          "update",
          {},
          [id, name, enabled]
        );
        // Redirect to show page
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
  if ($("#groups-edit").length) {
    GROUPS_EDIT.init();
    SMART_CONTRACTS_NEW.test();
  }
});
