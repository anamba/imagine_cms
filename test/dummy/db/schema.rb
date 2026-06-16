# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2025_11_20_063819) do
  create_table "cms_asset_tags", id: :integer, charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.integer "cms_asset_id", null: false
    t.datetime "created_on", precision: nil
    t.string "name"
    t.datetime "updated_on", precision: nil
    t.integer "user_id", null: false
  end

  create_table "cms_assets", id: :integer, charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.string "content_type"
    t.datetime "created_on", precision: nil
    t.string "name"
    t.datetime "updated_on", precision: nil
  end

  create_table "cms_page_comments", id: :integer, charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.integer "cms_page_id", null: false
    t.text "content"
    t.datetime "created_on", precision: nil
    t.string "owner", null: false
    t.string "owner_email"
    t.string "owner_url"
    t.datetime "updated_on", precision: nil
  end

  create_table "cms_page_objects", id: :integer, charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.integer "cms_page_id", null: false
    t.integer "cms_page_version", null: false
    t.text "content"
    t.datetime "created_on", precision: nil
    t.string "name"
    t.string "obj_type"
    t.text "options"
    t.datetime "updated_on", precision: nil
    t.index ["cms_page_id", "cms_page_version"], name: "cms_page_objects_cms_page_id_cms_page_version_index"
    t.index ["cms_page_id", "obj_type"], name: "cms_page_objects_cms_page_id_obj_type_index"
  end

  create_table "cms_page_tags", id: :integer, charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.integer "cms_page_id", null: false
    t.datetime "created_on", precision: nil
    t.string "name", null: false
  end

  create_table "cms_page_versions", charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.datetime "article_date", precision: nil
    t.datetime "article_end_date", precision: nil
    t.integer "cms_page_id"
    t.integer "cms_template_id"
    t.integer "cms_template_version"
    t.integer "comment_count", default: 0
    t.datetime "created_on", precision: nil
    t.datetime "expiration_date", precision: nil
    t.boolean "expires", default: false
    t.string "feature_image_path"
    t.text "html_head"
    t.string "name"
    t.integer "parent_id"
    t.string "path"
    t.integer "position", default: 0
    t.datetime "published_date", precision: nil
    t.integer "published_version", default: 0
    t.boolean "redirect_enabled", default: false, null: false
    t.integer "redirect_status_code", default: 302
    t.text "redirect_to"
    t.text "search_index"
    t.text "summary"
    t.string "thumbnail_path"
    t.string "title"
    t.integer "updated_by"
    t.string "updated_by_username"
    t.datetime "updated_on", precision: nil
    t.integer "version"
    t.index ["cms_page_id"], name: "index_cms_page_versions_on_cms_page_id"
  end

  create_table "cms_pages", id: :integer, charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.datetime "article_date", precision: nil
    t.datetime "article_end_date", precision: nil
    t.integer "cms_template_id", null: false
    t.integer "cms_template_version", null: false
    t.integer "comment_count", default: 0
    t.datetime "created_on", precision: nil
    t.datetime "expiration_date", precision: nil
    t.boolean "expires", default: false
    t.string "feature_image_path"
    t.text "html_head"
    t.string "name"
    t.integer "parent_id"
    t.string "path"
    t.integer "position", default: 0
    t.datetime "published_date", precision: nil, null: false
    t.integer "published_version", default: 0, null: false
    t.boolean "redirect_enabled", default: false, null: false
    t.integer "redirect_status_code", default: 302
    t.text "redirect_to"
    t.text "search_index"
    t.text "summary"
    t.string "thumbnail_path"
    t.string "title"
    t.integer "updated_by", null: false
    t.string "updated_by_username", null: false
    t.datetime "updated_on", precision: nil
    t.integer "version", default: 0, null: false
    t.index ["path"], name: "cms_pages_path_index"
  end

  create_table "cms_snippet_versions", charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.integer "cms_snippet_id"
    t.text "content"
    t.datetime "created_on", precision: nil
    t.string "name"
    t.datetime "updated_on", precision: nil
    t.integer "version"
    t.index ["cms_snippet_id"], name: "index_cms_snippet_versions_on_cms_snippet_id"
  end

  create_table "cms_snippets", id: :integer, charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.text "content"
    t.datetime "created_on", precision: nil
    t.string "name"
    t.datetime "updated_on", precision: nil
    t.integer "version", default: 0, null: false
    t.index ["name"], name: "cms_snippets_name_index"
  end

  create_table "cms_template_versions", charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.integer "cms_template_id"
    t.text "content"
    t.datetime "created_on", precision: nil
    t.string "name"
    t.text "options_yaml"
    t.datetime "updated_on", precision: nil
    t.integer "version"
    t.index ["cms_template_id"], name: "index_cms_template_versions_on_cms_template_id"
  end

  create_table "cms_templates", id: :integer, charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.text "content"
    t.datetime "created_on", precision: nil
    t.string "name"
    t.text "options_yaml"
    t.datetime "updated_on", precision: nil
    t.integer "version", default: 0, null: false
  end

  create_table "log_entries", id: :integer, charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.datetime "created_on", precision: nil
    t.text "data"
    t.text "description"
    t.integer "log_id", null: false
    t.string "type", null: false
    t.index ["type"], name: "IDX_log_entries_type"
  end

  create_table "logs", id: :integer, charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.datetime "created_on", precision: nil
    t.text "description"
    t.string "name"
  end

  create_table "settings", id: :integer, charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.datetime "created_on", precision: nil
    t.string "name", null: false
    t.datetime "updated_on", precision: nil
    t.text "value"
    t.index ["name"], name: "UN_settings_name", unique: true
  end

  create_table "tasks", id: :integer, charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.datetime "created_on", precision: nil
    t.string "name", null: false
    t.datetime "updated_on", precision: nil
    t.index ["name"], name: "UN_tasks_name", unique: true
  end

  create_table "user_group_memberships", primary_key: ["user_id", "user_group_id"], charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.datetime "created_on", precision: nil
    t.integer "user_group_id", null: false
    t.integer "user_id", null: false
  end

  create_table "user_groups", id: :integer, charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.datetime "created_on", precision: nil
    t.string "name"
    t.datetime "updated_on", precision: nil
    t.index ["name"], name: "UN_user_groups_name", unique: true
  end

  create_table "users", id: :integer, charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.boolean "active", default: true, null: false
    t.datetime "created_on", precision: nil
    t.text "dynamic_fields"
    t.string "first_name", limit: 100
    t.boolean "is_superuser", default: true, null: false
    t.string "last_name", limit: 100
    t.string "password_hash", limit: 100
    t.datetime "updated_on", precision: nil
    t.string "username"
    t.index ["username"], name: "UN_users_username", unique: true
  end
end
