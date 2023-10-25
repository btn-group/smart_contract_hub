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
    SMART_CONTRACTS_INDEX.addListeners();
    await ALEPH_ZERO.activatePolkadotJsExtension();
    if (!SMART_CONTRACTS_INDEX.datatable) {
      SMART_CONTRACTS_INDEX.datatable = new DataTable(
        "#smart-contracts-table",
        {
          columns: [
            {
              data: "id",
              title: "#",
            },
            {
              data: "address",
              title: "Smart Contract",
            },
            {
              data: "caller",
              title: "Caller",
            },
            {
              data: "azeroId",
              title: "AZERO.ID",
            },
            {
              data: "group.name",
              title: "Group",
            },
            {
              searchable: false,
              className: "text-end",
              defaultContent: "",
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
  },
  addListeners: () => {
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
};

// Even with turbo, init is called every time as listeners need to be replaced
$(document).on("turbo:load", function () {
  if ($("#smart-contracts-index").length) {
    SMART_CONTRACTS_INDEX.init();
  }
});
