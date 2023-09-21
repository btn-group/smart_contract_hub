class CreateSmartContracts < ActiveRecord::Migration[7.0]
  def change
    create_table :smart_contracts do |t|
      t.string :third_party_identifier, null: false, index: { unique: true }

      t.timestamps
    end
  end
end
