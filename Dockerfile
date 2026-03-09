FROM alpine:latest

COPY *.ajs /archi-scripts/
COPY review/*.ajs /archi-scripts/review/
COPY formatting/*.ajs /archi-scripts/formatting/
COPY lib/ /archi-scripts/lib/

CMD ["/bin/sh"]
