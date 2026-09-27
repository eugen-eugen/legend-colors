FROM alpine:latest

COPY *.ajs /archi-scripts/
COPY review/*.ajs /archi-scripts/review/
COPY formatting/*.ajs /archi-scripts/formatting/
COPY lib/ /archi-scripts/lib/

# Overlay the webpack-bundled versions (meta-model inlined) over their sources
COPY dist/MetaFormatting.ajs /archi-scripts/formatting/MetaFormatting.ajs
COPY dist/CheckMetaModelCompliance.ajs /archi-scripts/review/CheckMetaModelCompliance.ajs
COPY dist/SyncViewWithModel.ajs /archi-scripts/review/SyncViewWithModel.ajs

CMD ["/bin/sh"]
