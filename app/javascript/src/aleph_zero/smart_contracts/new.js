import { DirectUpload } from "@rails/activestorage";
import Dropzone from "dropzone";
import { ALEPH_ZERO } from "../helpers";
import { POLKADOTJS } from "../../polkadotjs";

const SMART_CONTRACTS_NEW = {
  init: async () => {
    SMART_CONTRACTS_NEW.addListeners();
    await ALEPH_ZERO.activatePolkadotJsExtension();
  },
  addListeners: () => {
    $(document).on("aleph_zero_account_selected", async () => {
      await ALEPH_ZERO.contracts.azeroIdRouter.getAndSetDomains();
      let $selectBox = $("select[name='smart_contract[azero_id]']");
      $selectBox.html("");
      ALEPH_ZERO.contracts.azeroIdRouter.domains.forEach(function (domain) {
        $selectBox.append(
          $("<option>", {
            value: domain,
            text: domain,
            selected:
              domain == ALEPH_ZERO.contracts.azeroIdRouter.primaryDomain,
          })
        );
      });

      $selectBox = $("select[name='smart_contract[group_id]']");
      $selectBox.html("");
      $selectBox.append(
        $("<option>", {
          value: undefined,
          text: "",
        })
      );
      let groupUsers = await ALEPH_ZERO.subsquid.groupUsers();
      groupUsers.forEach(function (groupUser) {
        $selectBox.append(
          $("<option>", {
            value: groupUser.group.id,
            text: groupUser.group.name,
          })
        );
      });
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
      e.preventDefault();
      let buttonSelector =
        "[name='smartContractNewForm'] button[type='submit']";
      document.disableButton(buttonSelector);
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
          document.smartContractNewForm["smart_contract[contract_url]"].value;
        let wasmUrl =
          document.smartContractNewForm["smart_contract[wasm_url]"].value;
        let auditUrl =
          document.smartContractNewForm["smart_contract[audit_url]"].value;
        let groupId =
          document.smartContractNewForm["smart_contract[group_id]"].value;
        let projectName =
          document.smartContractNewForm["smart_contract[project_name]"].value;
        let projectWebsite =
          document.smartContractNewForm["smart_contract[project_website]"]
            .value;
        let github =
          document.smartContractNewForm["smart_contract[github]"].value;

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
          "create",
          { value: 1_000_000_000_000 },
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
        document.showAlertSuccess("Success", true);
        // reset
        document.smartContractNewForm[
          "smart_contract[smart_contract_address]"
        ].value = "";
        document.smartContractNewForm["smart_contract[azero_id]"].value = "";
        Dropzone.forElement("#abi-dropzone").removeAllFiles(true);
        Dropzone.forElement("#contract-dropzone").removeAllFiles(true);
        Dropzone.forElement("#wasm-dropzone").removeAllFiles(true);
        Dropzone.forElement("#audit-dropzone").removeAllFiles(true);
        document.smartContractNewForm["smart_contract[project_name]"].value =
          "";
        document.smartContractNewForm["smart_contract[project_website]"].value =
          "";
        document.smartContractNewForm["smart_contract[github]"].value = "";
      } catch (err) {
        document.showAlertDanger(err);
      } finally {
        document.enableButton(buttonSelector);
      }
    };
  },
  createDropZones: function () {
    let url = $("#smart_contract_abi").attr("data-direct-upload-url");
    let headers = {
      "X-CSRF-Token": $(
        "form#new_smart_contract input[name=authenticity_token]"
      ).val(),
    };
    [
      ["#abi-dropzone", "application/json", "#smart_contract_abi_url", 0.5],
      ["#contract-dropzone", ".contract", "#smart_contract_contract_url", 0.5],
      ["#wasm-dropzone", "application/wasm", "#smart_contract_wasm_url", 0.5],
      ["#audit-dropzone", "application/pdf", "#smart_contract_audit_url", 2.5],
    ].forEach(function (dzParams) {
      let dropZone = new Dropzone(dzParams[0], {
        url,
        headers,
        maxFiles: 1,
        maxFilesize: dzParams[3],
        acceptedFiles: dzParams[1],
        addRemoveLinks: true,
        autoQueue: false,
        dictDefaultMessage: "Drop file here to upload",
      });
      dropZone.on("addedfile", function (file) {
        const upload = new DirectUpload(file, url);
        upload.create((error, blob) => {
          if (error) {
            document.showAlertDanger(error);
            return;
          } else {
            let url;
            if ($("body.rails-env-development").length) {
              url = `https://link.storjshare.io/jxilw2olwgoskdx2k4fvsswcfwfa/smart-contract-hub-development/${blob.key}`;
            } else {
              url = `https://link.storjshare.io/juldos5d7qtuwqx2itvdhgtgp3vq/smart-contract-hub-production/${blob.key}`;
            }
            $(dzParams[2]).val(url);
          }
        });
      });
      dropZone.on("removedfile", function (file) {
        $(dzParams[2]).val(undefined);
      });
    });
  },
};

// Even with turbo, init is called every time as listeners need to be replaced
$(document).on("turbo:load", function () {
  if ($("#smart-contracts-new").length) {
    SMART_CONTRACTS_NEW.init();
  }
});
