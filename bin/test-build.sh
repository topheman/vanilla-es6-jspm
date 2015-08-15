#!/usr/bin/env bash

# always stop on errors
# set -e

safeRunCommand() {
  typeset cmnd="$*"
  typeset ret_code

  printf "[RUN] $cmnd"
  eval $cmnd
  ret_code=$?
  if [ $ret_code != 0 ]; then
    printf "[ERROR] : [%d] when executing command: '$cmnd'" $ret_code
    return $ret_code
  fi
}

BUILD_DIST_IS_GIT=0

# vars retrieving the exit codes of the commands run
GIT_EXIT_CODE=0
GULP_BUILD_EXIT_CODE=0
GULP_CLEAN_EXIT_CODE=0

echo "###### TEST gulp build"

# If build/dist is under git, stash modification - fail if can't stash
if [ -d $(dirname $0)/../build/dist/.git ]
then
  BUILD_DIST_IS_GIT=1
  echo "[INFO] build/dist is under git management, preparing stashing modifications"
  cd $(dirname $0)/../build/dist
  echo "[INFO] $(pwd)"
  cmd="git stash save"
  GIT_EXIT_CODE=safeRunCommand $cmd
  if [ $GIT_EXIT_CODE -gt 0 ]
  then
    echo "[WARN] Couldn't stash modifications please commit your files in build/dist before proceeding"
    exit 1
  fi
fi

cmd="../../node_modules/gulp/bin/gulp.js build"
GULP_BUILD_EXIT_CODE=safeRunCommand $cmd

cmd="../../node_modules/gulp/bin/gulp.js clean"
GULP_CLEAN_EXIT_CODE=safeRunCommand $cmd

if [ $GULP_CLEAN_EXIT_CODE -gt 0 ] && [ BUILD_DIST_IS_GIT -eq 1 ]
then
  echo "[WARN] Couldn't clean the build/dist repo before git unstash"
  echo "[WARN] Run the following commands manually to get back your repo in build/dist"
  echo "[WARN] gulp clean"
  echo "[WARN] git reset --hard HEAD"
  echo "[WARN] git stash pop --index"
  exit 1
fi

# If build/dist is under git, reset --hard HEAD then retrieve the stash, fail if can't
if [ $BUILD_DIST_IS_GIT -eq 1 ]
then
  echo "[INFO] build/dist is under git management, retrieving stash"

  cmd="git reset --hard HEAD"
  GIT_EXIT_CODE=safeRunCommand $cmd
  if [ $GIT_EXIT_CODE -gt 0 ]
  then
    echo "[WARN] Couldn't git reset the build/dist repo before git unstash"
    echo "[WARN] Run the following commands manually to get back your repo in build/dist"
    echo "[WARN] git reset --hard HEAD"
    echo "[WARN] git stash pop --index"
    exit 1
  fi

  cmd="git stash pop --index"
  GIT_EXIT_CODE=safeRunCommand $cmd
  if [ $GIT_EXIT_CODE -gt 0 ]
  then
    echo "[WARN] Couldn't unstash build/dist repo"
    echo "[WARN] Run the following command manually to get back your repo in build/dist"
    echo "[WARN] git stash pop --index"
    exit 1
  fi
fi

#finally return an exit code according to the gulp build task
if [ $GULP_BUILD_EXIT_CODE -gt 0 ]
then
  echo "[FAILED] gulp build failed"
  exit 2
else
  echo "[PASSED] gulp build passed"
  exit 0
fi
