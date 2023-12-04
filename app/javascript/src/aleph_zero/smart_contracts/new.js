import { HELPERS } from "../../../application";
import { ALEPH_ZERO } from "../helpers";
import { POLKADOTJS } from "../../polkadotjs";

export const SMART_CONTRACTS_NEW = {
  init: async () => {
    SMART_CONTRACTS_NEW.addListeners();
    await HELPERS.initPopovers();
    $("html").attr("data-preloader", "disable");
    POLKADOTJS.listenForConnectButtonClick(ALEPH_ZERO);
    await ALEPH_ZERO.activatePolkadotJsExtension();
  },
  addListeners: () => {
    // === CUSTOM VALIDATIONS ===
    $("#smart_contract_smart_contract_address").on("input", async (_evt) => {
      let customValidity = "";
      if (
        !POLKADOTJS.validateAddress(
          $("#smart_contract_smart_contract_address").val()
        )
      ) {
        customValidity = "Invalid address.";
      }
      $("#smart_contract_smart_contract_address")[0].setCustomValidity(
        customValidity
      );
    });

    // === DROPZONE ===
    SMART_CONTRACTS_NEW.createDropZones();

    // === FORMS ===
    // pub fn create(
    //     &mut self,
    //     smart_contract_address: AccountId,
    //     chain: u8,
    //     azero_id: String,
    //     abi_url: String,
    //     contract_url: Option<String>,
    //     wasm_url: Option<String>,
    //     audit_url: Option<String>,
    //     group_id: Option<u32>,
    //     project_name: Option<String>,
    //     project_website: Option<String>,
    //     github: Option<String>,
    // ) -> Result<SmartContract> {
    document.smartContractNewForm.onsubmit = async (e) => {
      e.target.classList.add("was-validated");
      e.stopPropagation();
      e.preventDefault();
      if (!e.target.checkValidity()) {
        return;
      }
      HELPERS.button.disable(e.submitter);
      try {
        let address =
          document.smartContractNewForm[
            "smart_contract[smart_contract_address]"
          ].value;
        let chain =
          document.smartContractNewForm["smart_contract[chain]"].value;
        let azeroId =
          document.smartContractNewForm["smart_contract[azero_id]"].value;
        let abiUrl =
          document.smartContractNewForm["smart_contract[abi_url]"].value;
        let contractUrl =
          document.smartContractNewForm["smart_contract[contract_url]"].value ||
          undefined;
        let wasmUrl =
          document.smartContractNewForm["smart_contract[wasm_url]"].value ||
          undefined;
        let auditUrl =
          document.smartContractNewForm["smart_contract[audit_url]"].value ||
          undefined;
        let groupId =
          document.smartContractNewForm["smart_contract[group_id]"].value ||
          undefined;
        let projectName =
          document.smartContractNewForm["smart_contract[project_name]"].value ||
          undefined;
        let projectWebsite =
          document.smartContractNewForm["smart_contract[project_website]"]
            .value || undefined;
        let github =
          document.smartContractNewForm["smart_contract[github]"].value ||
          undefined;

        let api = await ALEPH_ZERO.api();
        let account = ALEPH_ZERO.account;
        api.setSigner(ALEPH_ZERO.getSigner());
        const contract = await ALEPH_ZERO.contracts[
          "smartContractHub"
        ].getContract();
        let response = await POLKADOTJS.contractTx(
          api,
          account.address,
          contract,
          "create",
          undefined,
          [
            address,
            chain,
            azeroId,
            abiUrl,
            contractUrl,
            wasmUrl,
            auditUrl,
            groupId,
            projectName,
            projectWebsite,
            github,
          ]
        );
        await ALEPH_ZERO.subsquid.waitForSync(response);
        HELPERS.toastr.message = "Success";
        HELPERS.toastr.alertType = document.showAlertSuccess;
        Turbo.visit(
          `/?search=${JSON.parse(response.decodedOutput).Ok.id}&search_by=id`
        );
      } catch (err) {
        document.showAlertDanger(err);
      } finally {
        HELPERS.button.enable(e.submitter);
      }
    };
  },
  createDropZones: function () {
    let csrfToken = $(
      "form#new_smart_contract input[name=authenticity_token]"
    ).val();
    let directUploadUrl = $("#smart_contract_abi").attr(
      "data-direct-upload-url"
    );
    HELPERS.dropzone.create(
      "#abi-dropzone",
      "application/json",
      "#smart_contract_abi_url",
      0.5,
      csrfToken,
      directUploadUrl
    );
    HELPERS.dropzone.create(
      "#contract-dropzone",
      ".contract",
      "#smart_contract_contract_url",
      0.5,
      csrfToken,
      directUploadUrl
    );
    HELPERS.dropzone.create(
      "#wasm-dropzone",
      "application/wasm",
      "#smart_contract_wasm_url",
      0.5,
      csrfToken,
      directUploadUrl
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
};
