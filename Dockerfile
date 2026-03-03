FROM alpine:latest

COPY *.ajs /archi-scripts/
COPY lib/ /archi-scripts/lib/

CMD ["/bin/sh"]
