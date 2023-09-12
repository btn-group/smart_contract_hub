# frozen_string_literal: true

Rails.application.routes.draw do
  resources :groups, only: %i[index show]
  resources :metadata, only: :new

  root 'metadata#index'
end
