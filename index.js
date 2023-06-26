// ==UserScript==
// @name         Clean Twitter
// @namespace    http://antfu.me/
// @version      0.3.1
// @description  Bring back peace on Twitter
// @author       Anthony Fu (https://github.com/antfu)
// @license      MIT
// @homepageURL  https://github.com/antfu/userscript-clean-twitter
// @supportURL   https://github.com/antfu/userscript-clean-twitter
// @match        https://twitter.com/**
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twitter.com
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @run-at       document-body
// ==/UserScript==

(function () {
    'use strict'

    function useOption(key, title, defaultValue) {
        if (typeof GM_getValue === 'undefined') {
            return {
                value: defaultValue,
            }
        }

        let value = GM_getValue(key, defaultValue)
        const ref = {
            get value() {
                return value
            },
            set value(v) {
                value = v
                GM_setValue(key, v)
                location.reload()
            },
        }

        GM_registerMenuCommand(`${title}: ${value ? '✅' : '❌'}`, () => {
            ref.value = !value
        })

        return ref
    }

    const selectForYou = useOption('twitter_select_for_you', 'For You', true)
    const hideFollowers = useOption('twitter_hide_followers', 'Hide Followers', true)

    const style = document.createElement('style')
    const hides = [
        // menu
        '[aria-label="Communities (New items)"], [aria-label="Communities"], [aria-label="Twitter Blue"], [aria-label="Timeline: Trending now"], [aria-label="时间线：当前趋势"], [aria-label="Who to follow"], [aria-label="Search and explore"], [aria-label="搜索和发现 "], [aria-label="Verified Organizations"]',
        // submean
        '* > [href="/i/verified-orgs-signup"]',
        // sidebar
        '[aria-label="Trending"] > * > *:nth-child(3), [aria-label="Trending"] > * > *:nth-child(4)',
        '[aria-label="当前趋势"] > * > *:nth-child(3), [aria-label="Trending"] > * > *:nth-child(4)',
        // "Verified" tab
        '[role="presentation"]:has(> [href="/notifications/verified"][role="tab"])',
        // verified badge
        '*:has(> * > [aria-label="Verified account"])',
        // Home tabs
        '[role="tablist"]:has([href="/home"][role="tab"])',
        // 主页
        '[aria-label="主页时间线"] > *:first-child',
        // Folowers
        hideFollowers.value && '* > [href$="/followers"][role="link"]',
    ].filter(Boolean)

    style.innerHTML = [
        `${hides.join(',')}{ display: none !important; }`,
        // styling
        '[aria-label="Search Twitter"] { margin-top: 20px !important; }',
    ].join('')

    document.body.appendChild(style)

    function selectTab() {
        if (window.location.pathname === '/home') {
            const tabIdx = selectForYou.value ? 0 : 1;
            const tabs = document.querySelectorAll('[href="/home"][role="tab"]')
            if (tabs.length === 2 && tabs[tabIdx].getAttribute('aria-selected') === 'false')
            {tabs[tabIdx].click()}
        }
    }

    function hideDiscoverMore() {
        const conversations = document.querySelector('[aria-label="Timeline: Conversation"]')?.children[0]
        if (!conversations) {return}

        let hide = false
        Array.from(conversations.children).forEach((el) => {
            if (hide) {
                el.style.display = 'none'
                return
            }

            const span = el.querySelector('h2 > div > span')

            if (span?.textContent.trim() === 'Discover more') {
                hide = true
                el.style.display = 'none'
            }
        })
    }

    window.addEventListener('load', () => {
        setTimeout(() => {
            selectTab()
            hideDiscoverMore()
        }, 500)
        setTimeout(() => {
            hideDiscoverMore()
        }, 1500)
        hideDiscoverMore()
    })
})()
