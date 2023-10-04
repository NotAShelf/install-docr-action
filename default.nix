{
  lib,
  buildNpmPackage,
  nodejs_20,
}:
buildNpmPackage {
  pname = "install-docr-action";
  version = "0.1.0";

  nativeBuildInputs = [nodejs_20];

  src = ./.;

  npmDepsHash = lib.fakeSha256;
}
