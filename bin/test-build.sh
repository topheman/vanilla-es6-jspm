#!/usr/bin/env bash

# This script will launch the gulp build task
#
# If your build/dist is under git management,
# it will git stash your modifications before doing anything and restore them
# at the end of the test (wether it passed or not)

# don't put this flag, we need to go through
# always stop on errors
# set -e

GULP_PATH="$(npm bin)/gulp"

BUILD_DIST_IS_GIT=0
BUILD_DIST_IS_GIT_DIRTY=0

# vars retrieving the exit codes of the commands run
GULP_BUILD_EXIT_CODE=0
GULP_CLEAN_EXIT_CODE=0

echo "###### TEST gulp build"

# If build/dist is under git, stash modification - fail if can't stash
if [ -d $(dirname $0)/../build/dist/.git ]
then
  BUILD_DIST_IS_GIT=1
  echo "[INFO] build/dist is under git management"
  cd $(dirname $0)/../build/dist
  echo "[INFO] $(pwd)"

  if [[ -n $(git status --porcelain) ]]
  then
    BUILD_DIST_IS_GIT_DIRTY=1
    echo "[INFO] build/dist has un-committed changes, stashing them"

    cmd="git stash save -u"
    echo "[RUN] $cmd"
    eval $cmd
    if [ $? -gt 0 ]
    then
      echo "[WARN] Couldn't stash modifications please commit your files in build/dist before proceeding"
      exit 1
    fi
  else
    echo "[INFO] build/dist repo is clean, nothing to stash"
  fi
fi

cmd="$GULP_PATH build"
echo "[RUN] $cmd"
eval $cmd
GULP_BUILD_EXIT_CODE=$?
echo "[DEBUG] gulp build exit code : $GULP_BUILD_EXIT_CODE";

cmd="$GULP_PATH clean"
echo "[RUN] $cmd"
eval $cmd
GULP_CLEAN_EXIT_CODE=$?
echo "[DEBUG] gulp clean exit code : $GULP_CLEAN_EXIT_CODE";

if [ $GULP_CLEAN_EXIT_CODE -gt 0 ] && [ $BUILD_DIST_IS_GIT_DIRTY -gt 0 ]
then
  echo "[WARN] Couldn't clean the build/dist repo before git unstash"
  echo "[WARN] Run the following commands manually to get back your repo in build/dist"
  echo "[INFO] gulp clean"
  echo "[INFO] git reset --hard HEAD"
  echo "[INFO] git stash pop --index"
  exit 1
fi

# After cleaning build/dist, if it is a git repo, point it back to the HEAD
if [ $BUILD_DIST_IS_GIT -gt 0 ]
then
  echo "[INFO] build/dist is under git management, pointing back to HEAD"

  cmd="git reset --hard HEAD"
  echo "[RUN] $cmd"
  eval $cmd
  if [ $? -gt 0 ]
  then
    echo "[WARN] Couldn't reset --hard HEAD build/dist repo"
    echo "[WARN] Run the following command manually to get back your repo in build/dist"
    echo "[INFO] git reset --hard HEAD"
    echo "[INFO] git stash pop --index"
    exit 1
  fi
fi

# If build/dist is a git repo and was dirty, retrieve the stash
if [ $BUILD_DIST_IS_GIT_DIRTY -gt 0 ]
then
  echo "[INFO] build/dist is under git management & has stashed files, retrieving stash"

  cmd="git stash pop --index"
  echo "[RUN] $cmd"
  eval $cmd
  if [ $? -gt 0 ]
  then
    echo "[WARN] Couldn't unstash build/dist repo"
    echo "[WARN] Run the following command manually to get back your repo in build/dist"
    echo "[INFO] git stash pop --index"
    exit 1
  fi
else
  if [ $BUILD_DIST_IS_GIT -gt 0 ]
  then
    echo "[INFO] build/dist is under git management but directory was clean at start, nothing to unstash"
  fi
fi

#finally return an exit code according to the gulp build task
if [ $GULP_BUILD_EXIT_CODE -gt 0 ]
then
  echo "[FAILED] gulp build failed. Exiting with code $GULP_BUILD_EXIT_CODE"
  echo "###### END TEST gulp build"
  exit $GULP_BUILD_EXIT_CODE
else
  echo "[PASSED] gulp build passed"
  echo "###### END TEST gulp build"
  exit 0
fi
