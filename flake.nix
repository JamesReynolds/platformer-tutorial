{
  description = "A shell";
  inputs = {
    nixpkgs.url = github:NixOS/nixpkgs;
  };
 
  outputs = { self, nixpkgs, ... } @ inputs:
    let
      pkgs = nixpkgs.legacyPackages."x86_64-linux";
    in
      {
        devShell."x86_64-linux" = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs
            vscode
            python3
            inotify-tools
          ];
          shellHook = ''
            export PATH=$(pwd)/node_modules/.bin/:$PATH
          '';
        };
      };
}
