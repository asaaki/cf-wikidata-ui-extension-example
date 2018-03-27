# Needs a SPACE env var,
# use direnv for convenient and add .envrc (see .envrc.example file)

UI_EXT_ID = cf-wikidata-ui-extension-example

SRC_DIR = src
DIST_DIR = dist
HTML_FILE = index.html
JS_FILE = extension.js

SRC_HTML = $(SRC_DIR)/$(HTML_FILE)
SRC_JS = $(SRC_DIR)/$(JS_FILE)
DIST_HTML = $(DIST_DIR)/$(HTML_FILE)
DIST_JS = $(DIST_DIR)/$(JS_FILE)

CF_EXT_CMD = yarn run contentful extension

TIDY_SETTINGS = -q -m -w 0 -i \
								--indent-with-tabs yes \
								--indent-spaces 2 \
								--tab-size 2 \
								--clean yes \
								--join-styles yes

build: $(DIST_DIR) $(DIST_HTML)

$(DIST_HTML): $(SRC_HTML) $(DIST_JS)
	cp $< $@
	echo "<script>" >> $@
	cat $(DIST_JS) >> $@
	echo "</script></body></html>" >> $@

$(DIST_JS): $(SRC_JS)
	yarn run browserify \
		-t [ babelify --presets es2015 --sourceMapRelative .] \
		--entry $^ --outfile $@

$(DIST_DIR):
	@mkdir -p $@

prepare:
	yarn install

update: extension.json
	$(CF_EXT_CMD) update --space-id $(SPACE)

update-force: extension.json
	$(CF_EXT_CMD) update --space-id $(SPACE) --force

create: extension.json
	$(CF_EXT_CMD) create --space-id $(SPACE)

delete:
	$(CF_EXT_CMD) delete --space-id $(SPACE) --id $(UI_EXT_ID)

clean: $(DIST_DIR)-clean node_modules-clean

$(DIST_DIR)-clean:
	@rm -rf $(DIST_DIR)

node_modules-clean:
	@rm -rf node_modules

tidy:
	tidy $(TIDY_SETTINGS) $(DIST_HTML)
