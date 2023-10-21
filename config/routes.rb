# frozen_string_literal: true

Rails.application.routes.draw do
  resources :smart_contracts, only: %i[index new]

  root 'smart_contracts#index'
end
