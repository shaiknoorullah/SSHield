#!/bin/sh
# Wrapper script for example-cli

NODE_PATH=/usr/lib/example-cli/node_modules node /usr/lib/example-cli/src/cli.js "$@"
