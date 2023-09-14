import { ALEPH_ZERO } from "../helpers";
import { POLKADOTJS } from "../../polkadotjs";

const GROUPS_EDIT = {
  id: undefined,
  init: async () => {
    GROUPS_EDIT.id = document.groupsEditForm.id.value;
    GROUPS_EDIT.addListeners();
    GROUPS_EDIT.setForm();
    await ALEPH_ZERO.activatePolkadotJsExtension();
  },
  addListeners: () => {
    // === FORMS ===
    document.groupsEditForm.onsubmit = async (e) => {
      e.preventDefault();
      let buttonSelector = "[name='groupsEditForm'] button[type='submit']";
      document.disableButton(buttonSelector);
      try {
        console.log(ALEPH_ZERO.account);
        let name = document.groupsEditForm.name.value;
        let enabled = document.groupsEditForm.enabled.checked;
        let api = await ALEPH_ZERO.api("staging");
        api.setSigner(ALEPH_ZERO.getSigner());
        const contract = await ALEPH_ZERO.contracts["azGroups"].getContract(
          "staging"
        );
        await POLKADOTJS.contractTx(
          api,
          ALEPH_ZERO.account.address,
          contract,
          "groupsUpdate",
          {},
          [GROUPS_EDIT.id, name, enabled]
        );
        // Redirect to show page
      } catch (err) {
        document.showAlertDanger(err);
      } finally {
        document.enableButton(buttonSelector);
      }
    };
  },
  setForm: async () => {
    let group = await ALEPH_ZERO.contracts.azGroups.show(
      GROUPS_EDIT.id,
      "staging"
    );
    document.groupsEditForm.name.value = group.name;
    document.groupsEditForm.enabled.checked = group.enabled;
  },
};

// Even with turbo, init is called every time as listeners need to be replaced
$(document).on("turbo:load", function () {
  if ($("#groups-edit").length) {
    GROUPS_EDIT.init();
  }
});
