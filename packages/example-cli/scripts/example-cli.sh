#!/bin/sh
# Wrapper script for example-cli

NODE_PATH=/usr/lib/sshield-example-cli/node_modules node /usr/lib/sshield-example-cli/dist/src/cli.js "$@"
