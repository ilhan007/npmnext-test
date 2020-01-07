#!/bin/bash

set -o nounset
set -o errexit

echo "//registry.npmjs.org/:username=${NPM_USERNAME}" >> ./.npmrc
echo "//registry.npmjs.org/:email=${NPM_EMAIL}" >> ./.npmrc
echo "//registry.npmjs.org/:_authToken=${NPM_AUTH_TOKEN}" >> ./.npmrc

echo "//registry.npmjs.org/:username=${NPM_USERNAME}" >> ./packages/base/.npmrc
echo "//registry.npmjs.org/:email=${NPM_EMAIL}" >> ./packages/base/.npmrc
echo "//registry.npmjs.org/:_authToken=${NPM_AUTH_TOKEN}" >> ./packages/base/.npmrc

echo "//registry.npmjs.org/:username=${NPM_USERNAME}" >> ./packages/min/.npmrc
echo "//registry.npmjs.org/:email=${NPM_EMAIL}" >> ./packages/min/.npmrc
echo "//registry.npmjs.org/:_authToken=${NPM_AUTH_TOKEN}" >> ./packages/min/.npmrc

echo "//registry.npmjs.org/:username=${NPM_USERNAME}" >> ./packages/fiori/.npmrc
echo "//registry.npmjs.org/:email=${NPM_EMAIL}" >> ./packages/fiori/.npmrc
echo "//registry.npmjs.org/:_authToken=${NPM_AUTH_TOKEN}" >> ./packages/fiori/.npmrc