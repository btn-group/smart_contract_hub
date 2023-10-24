import { HELPERS } from "../../../application";
import { ALEPH_ZERO } from "../helpers";
import { POLKADOTJS } from "../../polkadotjs";

const SMART_CONTRACTS_EDIT = {
  smartContract: undefined,
  init: async () => {
    SMART_CONTRACTS_EDIT.addListeners();
    // === GET SMART CONTRACT ===
    await SMART_CONTRACTS_EDIT.getAndSetContract();
    SMART_CONTRACTS_EDIT.fillForm();
    // === DROPZONE ===
    SMART_CONTRACTS_EDIT.createDropZones();
    await ALEPH_ZERO.activatePolkadotJsExtension();
  },
  addListeners: () => {
    $(document).on("aleph_zero_account_selected", async () => {
      await SMART_CONTRACTS_EDIT.validateAuthorisedToEdit();
      SMART_CONTRACTS_EDIT.getAndSetGroups();
      SMART_CONTRACTS_EDIT.getAndSetAzeroIds();
    });

    // === FORMS ===
    // #[allow(clippy::too_many_arguments)]
    // #[ink(message)]
    // pub fn update(
    //     &mut self,
    //     id: u32,
    //     enabled: bool,
    //     azero_id: String,
    //     group_id: Option<u32>,
    //     audit_url: Option<String>,
    //     project_name: Option<String>,
    //     project_website: Option<String>,
    //     github: Option<String>,
    // ) -> Result<SmartContract> {
    document.smartContractEditForm.onsubmit = async (e) => {
      e.preventDefault();
      document.disableButton(e.submitter);
      try {
        let id = Number(
          document.smartContractEditForm["smart_contract[id]"].value
        );
        let enabled = $("#smart_contract_enabled").prop("checked");
        let azeroId =
          document.smartContractEditForm["smart_contract[azero_id]"].value;
        let groupId =
          document.smartContractEditForm["smart_contract[group_id]"].value ||
          undefined;
        let auditUrl =
          document.smartContractEditForm["smart_contract[audit_url]"].value ||
          undefined;
        let projectName =
          document.smartContractEditForm["smart_contract[project_name]"]
            .value || undefined;
        let projectWebsite =
          document.smartContractEditForm["smart_contract[project_website]"]
            .value || undefined;
        let github =
          document.smartContractEditForm["smart_contract[github]"].value ||
          undefined;
        let api = await ALEPH_ZERO.api();
        let account = ALEPH_ZERO.account;
        api.setSigner(ALEPH_ZERO.getSigner());
        const contract = await ALEPH_ZERO.contracts[
          "smartContractHub"
        ].getContract();
        await POLKADOTJS.contractTx(
          api,
          account.address,
          contract,
          "update",
          undefined,
          [
            id,
            enabled,
            azeroId,
            groupId,
            auditUrl,
            projectName,
            projectWebsite,
            github,
          ]
        );

        HELPERS.toastr.message = "Success";
        HELPERS.toastr.alertType = document.showAlertSuccess;
        Turbo.visit("/");
      } catch (err) {
        document.showAlertDanger(err);
      } finally {
        document.enableButton(e.submitter);
      }
    };
  },
  createDropZones: function () {
    let csrfToken = $(
      "form#new_smart_contract input[name=authenticity_token]"
    ).val();
    let directUploadUrl = $("#smart_contract_audit").attr(
      "data-direct-upload-url"
    );
    HELPERS.dropzone.create(
      "#audit-dropzone",
      "application/pdf",
      "#smart_contract_audit_url",
      2.5,
      csrfToken,
      directUploadUrl
    );
  },
  fillForm: () => {
    document.smartContractEditForm[
      "smart_contract[smart_contract_address]"
    ].value = SMART_CONTRACTS_EDIT.smartContract.smartContractAddress;
    document.smartContractEditForm["smart_contract[project_name]"].value =
      SMART_CONTRACTS_EDIT.smartContract.projectName;
    document.smartContractEditForm["smart_contract[project_website]"].value =
      SMART_CONTRACTS_EDIT.smartContract.projectWebsite;
    document.smartContractEditForm["smart_contract[github]"].value =
      SMART_CONTRACTS_EDIT.smartContract.github;
    document.smartContractEditForm["smart_contract[audit_url]"].value =
      SMART_CONTRACTS_EDIT.smartContract.auditUrl;
    $("#smart_contract_enabled").prop(
      "checked",
      SMART_CONTRACTS_EDIT.smartContract.enabled
    );
  },
  getAndSetContract: async () => {
    try {
      let id = Number(
        document.smartContractEditForm["smart_contract[id]"].value
      );
      const contract = await ALEPH_ZERO.contracts[
        "smartContractHub"
      ].getContract();
      let api = await ALEPH_ZERO.api();
      let response = await POLKADOTJS.contractQuery(
        api,
        ALEPH_ZERO.b3,
        contract,
        "show",
        undefined,
        [id]
      );
      if (response.output.asOk.isErr) {
        HELPERS.toastr.message = "Smart contract not found";
        HELPERS.toastr.alertType = document.showAlertDanger;
        Turbo.visit("/");
      } else {
        SMART_CONTRACTS_EDIT.smartContract =
          response.output.asOk.asOk.toHuman();
      }
    } catch (err) {
      document.showAlertDanger(err);
    }
  },
  getAndSetAzeroIds: async () => {
    await ALEPH_ZERO.contracts.azeroIdRouter.getAndSetDomains();
    let $selectBox = $("select[name='smart_contract[azero_id]']");
    $selectBox.html("");
    ALEPH_ZERO.contracts.azeroIdRouter.domains.forEach(function (domain) {
      $selectBox.append(
        $("<option>", {
          value: domain,
          text: domain,
          selected: domain == SMART_CONTRACTS_EDIT.smartContract.azeroId,
        })
      );
    });
  },
  getAndSetGroups: async () => {
    // set groups select box
    let $selectBox = $("select[name='smart_contract[group_id]']");
    $selectBox.html("");
    $selectBox.append(
      $("<option>", {
        value: undefined,
        text: "",
      })
    );
    let groupUsers = await ALEPH_ZERO.subsquid.groupUsers();
    groupUsers.forEach(function (groupUser) {
      let selected =
        SMART_CONTRACTS_EDIT.smartContract.groupId &&
        Number(groupUser.group.id) ==
          Number(SMART_CONTRACTS_EDIT.smartContract.groupId);
      $selectBox.append(
        $("<option>", {
          value: groupUser.group.id,
          selected,
          text: groupUser.group.name,
        })
      );
    });
  },
  validateAuthorisedToEdit: async () => {
    try {
      if (
        SMART_CONTRACTS_EDIT.smartContract.caller != ALEPH_ZERO.account.address
      ) {
        HELPERS.toastr.message = "Unauthorised";
        HELPERS.toastr.alertType = document.showAlertDanger;
        Turbo.visit("/");
      }
    } catch (err) {
      document.showAlertDanger(err);
    }
  },
};

// Even with turbo, init is called every time as listeners need to be replaced
$(document).on("turbo:load", function () {
  if ($("#smart-contracts-edit").length) {
    SMART_CONTRACTS_EDIT.init();
  }
});
