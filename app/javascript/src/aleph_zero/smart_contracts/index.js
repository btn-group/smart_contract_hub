import { HELPERS } from "../../../application";
import { ALEPH_ZERO } from "../helpers";
import { POLKADOTJS } from "../../polkadotjs";

const SMART_CONTRACTS_INDEX = {
  datatable: undefined,
  queryCount: 0,
  init: async () => {
    if (HELPERS.toastr.message) {
      HELPERS.toastr.alertType(HELPERS.toastr.message, true);
      HELPERS.toastr.message = undefined;
      HELPERS.toastr.alertType = undefined;
    }
    SMART_CONTRACTS_INDEX.datatable = new DataTable("#smart-contracts-table", {
      columns: [
        {
          className: "dt-control position-relative",
          orderable: false,
          data: null,
          defaultContent: "",
        },
        {
          data: "id",
          title: "ID",
        },
        {
          data: "address",
          title: "Smart Contract",
          width: "40%",
          fnCreatedCell: function (nTd, sData, _oData, _iRow) {
            $(nTd).html(
              `<div class="cell-wrapper-wrapper"><div class="cell"><div class="cell-overflow">${sData}</div></div></div>`
            );
          },
        },
        {
          data: "caller",
          title: "Added By",
          width: "40%",
          fnCreatedCell: function (nTd, sData, _oData, _iRow) {
            $(nTd).html(
              `<div class="cell-wrapper-wrapper"><div class="cell"><div class="cell-overflow">${sData}</div></div></div>`
            );
          },
        },
        {
          className: "text-end",
          defaultContent: "",
          title: "Actions",
          fnCreatedCell: function (nTd, _sData, oData, _iRow) {
            if (
              ALEPH_ZERO.account &&
              ALEPH_ZERO.account.address == oData.caller
            ) {
              let html =
                '<div class="d-flex justify-content-end flex-shrink-0">';
              html += `<a href="#" data-smart-contract-id=${oData.id} class="edit-smart-contract-link btn btn-icon btn-color-muted btn-bg-light btn-active-color-primary btn-sm"><i class="bi bi-pencil-square fs-4 link-primary"></i></a>`;
              html += "</div>";
              $(nTd).html(html);
            }
          },
        },
      ],
      ordering: false,
      paging: false,
      processing: true,
      bInfo: false,
      searching: false,
      drawCallback: function () {
        $("#smart-contracts-index .edit-smart-contract-link").on(
          "click",
          async function (e) {
            e.preventDefault();
            let smartContractId = e.currentTarget.getAttribute(
              "data-smart-contract-id"
            );
            Turbo.visit(`/smart_contracts/${smartContractId}/edit`);
          }
        );
        $("#smart-contracts-table").removeClass("dataTable");
      },
    });
    SMART_CONTRACTS_INDEX.addListeners();
    $("html").attr("data-preloader", "disable");
    await ALEPH_ZERO.activatePolkadotJsExtension();
  },
  addListeners: () => {
    $(document).on("aleph_zero_account_selected", async () => {
      $("#search-input").trigger("input");
    });

    // Add event listener for opening and closing details
    SMART_CONTRACTS_INDEX.datatable.on("click", "td.dt-control", function (e) {
      let tr = e.target.closest("tr");
      let row = SMART_CONTRACTS_INDEX.datatable.row(tr);

      if (row.child.isShown()) {
        // This row is already open - close it
        row.child.hide();
        e.target.classList.remove("expanded");
      } else {
        // Open this row
        row
          .child(SMART_CONTRACTS_INDEX.datatableChildRowFormat(row.data()))
          .show();
        e.target.classList.add("expanded");
      }
    });

    $("#search-input").on("input", async (_evt) => {
      // 1. Set to loading and clear table
      SMART_CONTRACTS_INDEX.datatable.clear();
      SMART_CONTRACTS_INDEX.datatable.processing(true);

      // 2. Increase query count
      SMART_CONTRACTS_INDEX.queryCount += 1;
      let currentQueryCount = SMART_CONTRACTS_INDEX.queryCount;

      // 3. Search
      let search = $("#search-input").val();
      let searchBy = $("#search-by-select").val();
      let status = $("#status-select").val();
      let smartContracts = [];
      try {
        // Check validation
        if (
          (search.length &&
            ((["address", "addedBy"].includes(searchBy) &&
              POLKADOTJS.validateAddress(search)) ||
              !["address", "addedBy"].includes(searchBy))) ||
          search.length == 0
        ) {
          $("#smart-contracts-index form").removeClass("was-validated");
          $("#search-input")[0].setCustomValidity("");
          $("#smart-contracts-index .invalid-feedback").removeClass("d-block");
          $("#search-input").addClass("border-light");
          // 3. Delay
          await document.delay(500);
          if (currentQueryCount == SMART_CONTRACTS_INDEX.queryCount) {
            let response = await $.ajax({
              type: "post",
              url: ALEPH_ZERO.subsquid.url,
              contentType: "application/json; charset=utf-8",
              data: ALEPH_ZERO.subsquid.queryData(search, searchBy, status),
            });
            smartContracts = response.data.smartContracts;
          }
        } else {
          $("#smart-contracts-index form").addClass("was-validated");
          $("#search-input")[0].setCustomValidity("Invalid address.");
          $("#smart-contracts-index .invalid-feedback").addClass("d-block");
          $("#search-input").removeClass("border-light");
        }
      } finally {
        if (currentQueryCount == SMART_CONTRACTS_INDEX.queryCount) {
          SMART_CONTRACTS_INDEX.datatable.rows.add(smartContracts);
          $("#smart-contracts-table").width("100%");
          SMART_CONTRACTS_INDEX.datatable.columns.adjust().draw();
          SMART_CONTRACTS_INDEX.datatable.processing(false);
        }
      }
    });

    $("#search-by-select").on("change", async (_evt) => {
      $("#search-input").trigger("input");
    });

    $("#status-select").on("change", async (_evt) => {
      $("#search-input").trigger("input");
    });
  },
  chainToString: (index) => {
    let mapping = { 0: "Production", 1: "Testnet" };
    return mapping[index];
  },
  // pub struct SmartContract {
  //     id: u32,
  //     smart_contract_address: AccountId,
  //     chain: u8,
  //     caller: AccountId,
  //     enabled: bool,
  //     azero_id: String,
  //     abi_url: String,
  //     contract_url: Option<String>,
  //     wasm_url: Option<String>,
  //     audit_url: Option<String>,
  //     group_id: Option<u32>,
  //     project_name: Option<String>,
  //     project_website: Option<String>,
  //     github: Option<String>,
  // }
  datatableChildRowFormat: (d) => {
    let html =
      "<div class='table-responsive'><table class='table fs-6 align-middle mb-0'><tbody>";
    // id
    html += `<tr><th>ID</th><td>${d.id}</td></tr>`;
    // smart_contract_address
    if (d.chain == 0) {
      html += `<tr><th>Address</th><td><a class="link-primary" href="https://alephzero.subscan.io/wasm_contract/${d.address}" target="_blank">${d.address}</a></td></tr>`;
    } else {
      html += `<tr><th>Address</th><td>${d.address}</td></tr>`;
    }
    // chain
    html += `<tr><th>Chain</th><td>${SMART_CONTRACTS_INDEX.chainToString(
      d.chain
    )}</td></tr>`;
    // caller
    html += `<tr><th>Added By</th><td><a class="link-primary" href="https://alephzero.subscan.io/account/${d.caller}" target="_blank">${d.caller}</a></td></tr>`;
    // enabled
    let enabledButtonHtml;
    if (d.enabled) {
      enabledButtonHtml = '<span class="badge bg-success">Enabled</span>';
    } else {
      enabledButtonHtml = '<span class="badge bg-danger">Disabled</span>';
    }
    html += `<tr><th>Status</th><td>${enabledButtonHtml}</td></tr>`;
    // azero_id
    html += `<tr><th>AZERO.ID</th><td><a class="link-primary" href="https://azero.id/id/${d.azeroId}" target="_blank">${d.azeroId}</a></td></tr>`;
    // abi_url
    html += `<tr><th>ABI URL</th><td><a class="link-primary" href="${d.abiUrl}" target="_blank">${d.abiUrl}</a></td></tr>`;
    // contract_url
    html += `<tr><th>Contract URL</th><td><a class="link-primary" href="${
      d.contractUrl
    }" target="_blank">${d.contractUrl || ""}</a></td></tr>`;
    // wasm_url
    html += `<tr><th>WASM URL</th><td><a class="link-primary" href="${
      d.wasmUrl
    }" target="_blank">${d.wasmUrl || ""}</a></td></tr>`;
    // audit_url
    html += `<tr><th>Audit URL</th><td><a class="link-primary" href="${
      d.auditUrl
    }" target="_blank">${d.auditUrl || ""}</a></td></tr>`;
    // group_id
    if (d.group) {
      html += `<tr><th>Group</th><td><a class="link-primary" href="https://btn.group/aleph_zero/groups?id=${d.group.id}" target="_blank">${d.group.name}</a></td></tr>`;
    } else {
      html += `<tr><th>Group</th><td></td></tr>`;
    }
    // project_name
    html += `<tr><th>Project Name</th><td>${d.projectName || ""}</td></tr>`;
    // project_website
    html += `<tr><th>Project Website</th><td><a class="link-primary" href="${
      d.projectWebsite
    }" target="_blank">${d.projectWebsite || ""}</a></td></tr>`;
    // github
    html += `<tr><th>Github</th><td><a class="link-primary" href="${
      d.github
    }" target="_blank">${d.github || ""}</a></td></tr>`;
    html += "</tbody></table></div>";
    return html;
  },
};

// Even with turbo, init is called every time as listeners need to be replaced
$(document).on("turbo:load", function () {
  if ($("#smart-contracts-index").length) {
    SMART_CONTRACTS_INDEX.init();
  }
});
