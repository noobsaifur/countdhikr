{ pkgs, ... }: {
  # 'unstable' is recommended for Project IDX to get the latest tools like Node 22
  channel = "unstable"; 

  packages = [
    pkgs.nodejs_22
    pkgs.openjdk17
    pkgs.glibcLocales
    pkgs.curl
    pkgs.unzip
    pkgs.android-tools
  ];

  env = {
    JAVA_HOME = "${pkgs.openjdk17}";
    LANG = "en_US.UTF-8";
    LC_ALL = "en_US.UTF-8";
    JAVA_TOOL_OPTIONS = "-Dfile.encoding=UTF-8";
  };
  idx = {
    previews = {
      enable = true;
    };
  };
}