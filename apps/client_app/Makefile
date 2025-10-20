FLUTTER?=flutter

.PHONY: gen-icons gen-l10n analyze test android-release ios-release

gen-icons:
	@echo "No icon generation script defined (kept design intact)"

gen-l10n:
	$(FLUTTER) gen-l10n

analyze:
	$(FLUTTER) analyze

test:
	$(FLUTTER) test --coverage

android-release:
	$(FLUTTER) build appbundle \
		--release \
		--dart-define-from-file=.env.prod \
		--split-debug-info=build/symbols \
		--obfuscate

ios-release:
	$(FLUTTER) build ipa \
		--release \
		--dart-define-from-file=.env.prod \
		--split-debug-info=build/symbols \
		--obfuscate
