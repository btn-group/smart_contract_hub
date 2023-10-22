class SmartContractsRemoveColumnThirdPartyIdentifier < ActiveRecord::Migration[7.0]
  def change
    remove_column :smart_contracts, :third_party_identifier
  end
end
