# frozen_string_literal: true

FactoryBot.define do
  factory :smart_contract do
    after(:build) do |smart_contract|
      smart_contract.abi.attach(io: Rails.root.join('spec/factories/jsons/metadata.json').open, filename: 'metadata.json', content_type: 'application/json')
    end
  end
end
