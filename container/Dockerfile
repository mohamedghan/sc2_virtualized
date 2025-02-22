FROM debian

ENV DEBIAN_FRONTEND=noninteractive
ENV USER=root

RUN apt-get update && apt-get install -y --no-install-recommends \
    xfce4 \
    xfce4-goodies \
    xfonts-base \
    blackbird-gtk-theme \
    elementary-xfce-icon-theme \
    tigervnc-standalone-server \
    dbus-x11 \
    git \
    curl \
    libqt5gui5 \
    openssh-client \
    openssh-server \
    apt-file \
    gdb \
    gcc \
    g++ \
    neofetch \
    binutils \
    file \
    nmap \
    avahi-daemon \
    avahi-utils \
    firefox-esr \
    build-essential \
    sudo \
    less \
    gvfs \
    nano \
    netcat-openbsd \
    python3-venv \
    python3-pip \
    man \ 
    texinfo \
    tumbler \
    file-roller \
    bash-completion \
    inetutils-ping \
    iproute2 \
    ca-certificates \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN useradd -m hacker -s /bin/bash
RUN groupadd wireshark
RUN usermod -aG wireshark hacker
USER hacker
ENV USER=hacker

RUN touch /home/hacker/.Xauthority


COPY hacker.conf /etc/sudoers.d/hacker

WORKDIR /home/hacker

COPY --chmod=777 start-vnc.sh /start-vnc
COPY --chown=hacker:hacker xfce4 /home/hacker/.config/xfce4
COPY --chown=hacker:hacker logo_debian.png /home/hacker/bg.png


USER hacker
ENTRYPOINT ["/start-vnc"]
