# frozen_string_literal: true

class GroupsController < ApplicationController
  def index; end

  def show; end

  def edit
    @id = params[:id]
  end
end
