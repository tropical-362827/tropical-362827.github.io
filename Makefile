# tropical-362827.github.io Makefile

.PHONY: help dev dev-host build preview install clean deploy

# デフォルトターゲット
help:
	@echo "Available targets:"
	@echo "  dev        - 開発サーバー起動 (localhost:3000)"
	@echo "  dev-host   - 外部アクセス可能な開発サーバー起動"
	@echo "  build      - プロダクションビルド"
	@echo "  preview    - ビルド後のプレビューサーバー"
	@echo "  install    - 依存関係インストール"
	@echo "  clean      - ビルドファイル削除"
	@echo "  deploy     - GitHub Pagesにデプロイ"

# 開発サーバー (ローカルのみ)
dev:
	npm run dev

# 開発サーバー (外部アクセス可能)
dev-host:
	npm run dev -- --host

# プロダクションビルド
build:
	npm run build

# プレビューサーバー
preview:
	npm run preview

# 依存関係インストール
install:
	npm install

# ビルドファイル削除
clean:
	rm -rf dist

# GitHub Pagesにデプロイ
deploy:
	npm run deploy