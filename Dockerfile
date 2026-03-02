FROM alpine:latest

COPY *.ajs /archi-scripts/legend-colors/
COPY lib/ /archi-scripts/legend-colors/lib/

CMD ["/bin/sh"]
