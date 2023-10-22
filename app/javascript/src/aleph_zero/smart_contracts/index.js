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
          ],
          ordering: false,
          paging: false,
          processing: true,
          bInfo: false,
          searching: false,
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
