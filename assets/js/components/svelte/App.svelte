<script>
    import Header from './Header.svelte';
    
    console.log('swag')
</script>
<style>
    h1 {
        color: red;
    }
</style>
<Header />
<div class="home">
    <div class="Aligner">
        <div class="Aligner-item">
            <img alt="CodingPhase Logo" src="/img/logo.png" />
            <h1>Dev-Starter-Kit</h1>
            <div class="menu">
                <ul>
                    <li>
                        <a href="http://starterkit.codingphase.com" target="new">
                            Documentation
                        </a>
                    </li>
                    <li>
                        <a href="http://www.codingphase.com" target="new">
                            CodingPhase.Com
                        </a>
                    </li>
                </ul>
            </div>
            <div class="version-num">version 4.0.2</div>
            <br />
            <a
                class="github-button"
                href="https://github.com/codingphasedotcom/Dev-Starter-Kit"
                data-icon="octicon-star"
                data-style="mega"
                data-count-href="/codingphasedotcom/rocky/stargazers"
                data-count-api="/repos/codingphasedotcom/rocky#stargazers_count"
                data-count-aria-label="# stargazers on GitHub"
                aria-label="Star codingphasedotcom/rocky on GitHub"
            >
                Star
            </a>
        </div>
    </div>
</div>
