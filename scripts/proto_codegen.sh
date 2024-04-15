#!/bin/bash
# This has been picked from https://github.com/open-telemetry/opentelemetry-python/blob/e4a4410dc046f011194eff78e801fb230961eec8/scripts/proto_codegen.sh
# This doesn't generate the grpc stubs
set -ex

repo_root="$(git rev-parse --show-toplevel)"
PROTO_REPO_DIR="$repo_root/protos"
venv_dir="/tmp/proto_codegen_venv"


cd "$repo_root"/

# clean up old generated code
find "$repo_root"/protos/ -regex ".*_pb2.*\.pyi?" -exec rm {} +

# generate proto code for all protos
all_protos=$(find "$PROTO_REPO_DIR" -iname "*.proto")
python -m grpc_tools.protoc \
    -I "$repo_root" \
    --python_out=. \
    --mypy_out=. \
    $all_protos

echo "Latest proto generation done."