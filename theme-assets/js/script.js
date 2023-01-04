window.RequestError = class extends Error {
    constructor(response) {
        super(response.status);
        this.response = response;
    }
}

window.handleErrors = function (e) {
    if (!(e instanceof window.RequestError)) {
        window.toasted.show(e.message, {
            type: "error"
        });
    }

    const isJson = e.response.headers.get('Content-Type') === 'application/json';
    const promise = isJson ? e.response.json() : e.response.text();
    promise.then(function (data) {
        if (isJson) {
            window.toasted.show(data.message, {
                type: "error"
            });
        } else {
            const backdrop = document.createElement('div');
            const bdStyles = {
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.5)',
                zIndex: 9999,
            }

            for (style in bdStyles)
                backdrop.style[style] = bdStyles[style]

            const iframe = document.createElement("iframe")
            const styles = {
                position: "fixed",
                height: '90vh',
                width: '90vw',
                top: '5vh',
                left: '5vw',
                borderRadius: '8px',
                backgroundColor: '#18171B',
                border: '0px',
                zIndex: 99999
            };
            for (style in styles)
                iframe.style[style] = styles[style];

            backdrop.addEventListener('click', function () {
                backdrop.remove();
                iframe.remove();
            });

            iframe.sandbox.add('allow-scripts', 'allow-same-origin', 'allow-popups', 'allow-forms');
            document.body.append(backdrop, iframe);

            const page = document.createElement('html')
            page.innerHTML = data

            iframe.contentWindow.document.open()
            iframe.contentWindow.document.write(page.outerHTML)
            iframe.contentWindow.document.close()
        }
    });
}
function SplashComponent() {
    return {
        /**
         * @var {Record<string, any|Record<string,any>|Record<string,any>[]>}
         */
        tiktokVideo: null,
        url: "",
        processing: false,
        submitForm() {

            if (!validateURL(this.url)) {
                return window.toasted.show("Please enter a valid URL", {
                    type: "error"
                });
            }

            this.processing = true;
            const instance = this;
            const formData = new FormData(this.$refs.form);

            fetch(this.$refs.form.action, {
                method: this.$refs.form.method,
                body: formData,
                headers: {
                    "accept": "application/json"
                }
            })
                .then(function (response) {
                    if (response.status !== 200 || !response.headers.get('content-type').includes('json')) {
                        throw new window.RequestError(response);
                    }
                    return response.json();
                })
                .then(function (data) {
                    instance.tiktokVideo = data;
                })
                .catch(function (error) {
                    window.handleErrors(error);
                })
                .finally(function () {
                    instance.processing = false;
                });
        },
        //Paste logic
        get canPaste() {
            return window.navigator.clipboard;
        },
        pasteText() {
            if (this.canPaste) {
                const instance = this;
                window.navigator.clipboard.readText().then(function (text) {
                    instance.url = text;
                });
            }
        },
        downloadText(download) {
            return (download.isHD ? "Without Watermark [:idx] HD" : "Without Watermark [:idx]").replace(":idx", download.idx + 1);
        },
        downloadSize(download) {
            if (!download.size) return ''
            return ' ' + bytesToSize(download.size);
        },

        searchVideo(event) {
            const instance = this;
            this.resetVideo(event.detail).then(function () {
                instance.submitForm();
                window.scrollTo({top: 0});
            });
        },
        resetVideo(url = "") {
            this.url = url;

            this.tiktokVideo = null;
            return this.$nextTick();
        },
        downloadVideo(e) {
            let anchorEl = e.target;
            if (anchorEl.tagName.toLowerCase() !== 'a') {
                anchorEl = anchorEl.closest('a');
            }

            if (!anchorEl || !anchorEl.href) return;

            const url = new URL('/download', 'https://tiktok.codespikex.com');
            const extension = anchorEl.dataset.extension ?? 'mp4';
            const size = anchorEl.dataset.size;

            url.searchParams.set('url', btoa(anchorEl.href));
            url.searchParams.set('extension', extension);
            if (typeof size === 'string' && size.trim() !== '')
                url.searchParams.set('size', size);

            open(url.toString(), "_blank");
        }
    };
}

function bytesToSize(bytes) {
    const units = ["byte", "kilobyte", "megabyte", "terabyte", "petabyte"];
    const unit = Math.floor(Math.log(bytes) / Math.log(1024));
    return new Intl.NumberFormat("en", {
        style: "unit",
        unit: units[unit],
        unitDisplay: 'narrow',
        notation: 'compact'
    }).format(bytes / 1024 ** unit);
}

function validateURL(url) {
    return /^(https?:\/\/)?(www\.)?vm\.tiktok\.com\/[^\n]+\/?$/.test(url)
        || /^(https?:\/\/)?(www\.)?m\.tiktok\.com\/v\/[^\n]+\.html([^\n]+)?$/.test(url)
        || /^(https?:\/\/)?(www\.)?tiktok\.com\/t\/[^\n]+\/?$/.test(url)
        || /^(https?:\/\/)?(www\.)?tiktok\.com\/@[^\n]+\/video\/[^\n]+$/.test(url)
        || /^(https?:\/\/)?(www\.)?vt\.tiktok\.com\/[^\n]+\/?$/.test(url)
}
function AccordionComponent() {
    return {
        show: false,
        toggleShow() {
            this.show = !this.show;
        }
    };
}
function HeaderComponent() {
    return {
        showNav: false,
        toggleNav() {
            this.showNav = !this.showNav;
        }
    };
}
function ChangeLocaleComponent() {
    return {
        showMenu: false,
        closeMenu() {
            this.showMenu = false;
        },
        toggleMenu() {
            this.showMenu = !this.showMenu;
        }
    };
}
