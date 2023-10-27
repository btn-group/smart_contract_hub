import { HELPERS } from "../../../application";
import { ALEPH_ZERO } from "../helpers";

const SMART_CONTRACTS_INDEX = {
  datatable: undefined,
  queryCount: 0,
  init: async () => {
    if (HELPERS.toastr.message) {
      HELPERS.toastr.alertType(HELPERS.toastr.message, true);
      HELPERS.toastr.message = undefined;
      HELPERS.toastr.alertType = undefined;
    }
    if (!SMART_CONTRACTS_INDEX.datatable) {
      SMART_CONTRACTS_INDEX.datatable = new DataTable(
        "#smart-contracts-table",
        {
          columns: [
            {
              className: "dt-control",
              orderable: false,
              data: null,
              defaultContent: "",
              width: 62,
            },
            {
              data: "id",
              title: "#",
              width: 20,
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
              searchable: false,
              className: "text-end",
              defaultContent: "",
              title: "Actions",
              width: 58,
              fnCreatedCell: function (nTd, _sData, oData, _iRow) {
                if (
                  ALEPH_ZERO.account &&
                  ALEPH_ZERO.account.address == oData.caller
                ) {
                  let html =
                    '<div class="d-flex justify-content-end flex-shrink-0">';
                  html += `<a href="#" data-smart-contract-id=${oData.id} class="edit-smart-contract-link btn btn-icon btn-color-muted btn-bg-light btn-active-color-primary btn-sm"><i class="bi bi-pencil-square fs-3"></i></a>`;
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
          },
        }
      );
    }
    SMART_CONTRACTS_INDEX.addListeners();
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
      } else {
        // Open this row
        row
          .child(SMART_CONTRACTS_INDEX.datatableChildRowFormat(row.data()))
          .show();
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
      let smartContracts = [];
      try {
        if (search.length) {
          await document.delay(500);
          let response = await $.ajax({
            type: "post",
            url: ALEPH_ZERO.subsquid.url,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({
              query: `query MyQuery {
                smartContracts(where: {address_containsInsensitive: "${search}", OR: {group: {name_containsInsensitive: "${search}"}, OR: {caller_containsInsensitive: "${search}", OR: {azeroId_containsInsensitive: "${search}"}}}}) {
                  abiUrl
                  address
                  auditUrl
                  azeroId
                  caller
                  chain
                  contractUrl
                  enabled
                  github
                  id
                  projectName
                  wasmUrl
                  projectWebsite
                  group {
                    name
                  }
                }
              }`,
            }),
          });
          smartContracts = response.data.smartContracts;
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
    html += `<tr><th>#</th><td>${d.id}</td></tr>`;
    // smart_contract_address
    html += `<tr><th>Address</th><td>${d.address}</td></tr>`;
    // chain
    html += `<tr><th>Chain</th><td>${SMART_CONTRACTS_INDEX.chainToString(
      d.chain
    )}</td></tr>`;
    // caller
    html += `<tr><th>Added By</th><td>${d.caller}</td></tr>`;
    // enabled
    html += `<tr><th>Enabled</th><td>${d.enabled}</td></tr>`;
    // azero_id
    html += `<tr><th>AZERO.ID</th><td>${d.azeroId}</td></tr>`;
    // abi_url
    html += `<tr><th>ABI URL</th><td>${d.abiUrl}</td></tr>`;
    // contract_url
    html += `<tr><th>Contract URL</th><td>${d.contractUrl}</td></tr>`;
    // wasm_url
    html += `<tr><th>WASM URL</th><td>${d.wasmUrl}</td></tr>`;
    // audit_url
    html += `<tr><th>Audit URL</th><td>${d.auditUrl}</td></tr>`;
    // group_id
    let groupName = "";
    if (d.group) {
      groupName = d.group.name;
    }
    html += `<tr><th>Group</th><td>${groupName}</td></tr>`;
    // project_name
    html += `<tr><th>Project Name</th><td>${d.projectName}</td></tr>`;
    // project_website
    html += `<tr><th>Project Website</th><td>${d.projectWebsite}</td></tr>`;
    // github
    html += `<tr><th>Github</th><td>${d.github}</td></tr>`;
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
