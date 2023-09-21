# frozen_string_literal: true

FactoryBot.define do
  factory :smart_contract do
    sequence(:third_party_identifier) { |n| n }
    after(:build) do |smart_contract|
      smart_contract.abi.attach(io: File.open(Rails.root.join('spec', 'factories', 'jsons', 'metadata.json')), filename: 'metadata.json', content_type: 'application/json')
    end
  end
end
