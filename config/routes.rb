# frozen_string_literal: true

Rails.application.routes.draw do
  resources :smart_contracts
  resources :groups, only: %i[index show edit]

  root 'smart_contracts#index'
end
