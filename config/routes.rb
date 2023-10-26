# frozen_string_literal: true

Rails.application.routes.draw do
  resources :smart_contracts, only: %i[index new edit]
  get "about" => 'application#about'

  root 'smart_contracts#index'
end
