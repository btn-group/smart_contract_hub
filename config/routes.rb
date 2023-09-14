# frozen_string_literal: true

Rails.application.routes.draw do
  resources :groups, only: %i[index show]
  resources :smart_contracts, only: :new

  root 'smart_contracts#index'
end
