#!/bin/bash


export GIT_REPO="$GIT_REPO"

git clone "$GIT__URL" /home/app/output

exec node script.js
