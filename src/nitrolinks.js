(function() {
    const NitroLinks = {
        start() {
            this.assignLinkHandlers();
            this.assignHistoryHandlers();
        },

        assignLinkHandlers() {
            Array.from(document.querySelectorAll('a')).forEach(el => {
                let url = el.href;

                if (url.startsWith('http://' + window.location.host) || url.startsWith('https://' + window.location.host)) {
                    el.addEventListener('click', (e) => {
                        this.handleClick(e, url)
                    })
                }
            })
        },

        assignHistoryHandlers() {
            window.onpopstate = (e) => {
                this.handleLoad(e.target.location.href, false);
            }
        },

        handleClick(event, url) {
            // this will take link_element's href and pass it into 'handleLoad'
            event.preventDefault();

            this.handleLoad(url)
        },

        handleLoad(url, updateHistory = true) {
            // this will load url and replace fetched html into the page.
            fetch(url)
                .then(response => response.text())
                .then(data => {
                    // but really we only want to replace body tag contents.
                    let bodyStart = data.indexOf('<body'); // TODO: how is this going to work with UPPERCASE tags?
                    let bodyStartEnd = data.indexOf('>', bodyStart) + 1;
                    let bodyEnd = data.indexOf('</body>');
                    document.body.outerHTML = data.substr(bodyStartEnd, bodyEnd - bodyStartEnd);

                    let titleMatches = data.substr(0, bodyStart).match(/\<title\>(.*)\<\/title\>/i);
                    let title = titleMatches.length > 0 ? titleMatches.pop() : '';

                    // also call 'assignHandlers' when done, to process newly rendered links.
                    this.assignLinkHandlers();

                    // change url in address bar??
                    if (updateHistory) {
                        this.displayNewUrl(title, url);
                    }
                })
        },

        displayNewUrl(title, url) {
            history.pushState({}, '', url)
        },
    }

    if (!window.NitroLinks) {
        window.NitroLinks = NitroLinks;
        window.NitroLinks.start();
    }
}());
