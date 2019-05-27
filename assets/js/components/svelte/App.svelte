<script>
    import Header from './Header.svelte';
    export let name;
</script>
<style>
    h1 {
        color: red;
    }
</style>
<Header />
<h1>Hello {name}!</h1>
