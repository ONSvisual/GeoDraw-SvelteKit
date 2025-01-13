<script>
  import {
    Container,
    Theme,
    Section,
    Titleblock,
    Button
  } from "@onsvisual/svelte-components";
  import Lede from "$lib/layout/Lede.svelte";
  import { base } from "$app/paths";
</script>

<div class="flex flex-col min-h-screen">
  <div class="flex-grow">
    <Theme theme="light">
      <Titleblock title="Build a custom area profile" background="#f5f5f5">
        <Lede
          >Create your own profile for local areas in England and Wales using
          Census 2021 data.</Lede
        >
        
        <div style:height="32px" />
        <Button icon="arrow" iconPosition="after" href="{base}/draw">Get started</Button>
      </Titleblock>
      <Section marginTop>
        

        <h2>How to use the profile builder</h2>
        <h3>Step 1 - Create an area profile</h3>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto ab sapiente animi necessitatibus accusantium eaque magni tempora laborum mollitia dolore, officia, aliquid, eos atque veniam nesciunt beatae quae ipsa voluptate.</p>
        <h3>Step 2 - Build a profile for the area</h3>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto ab sapiente animi necessitatibus accusantium eaque magni tempora laborum mollitia dolore, officia, aliquid, eos atque veniam nesciunt beatae quae ipsa voluptate.</p>
      </Section>
    </Theme>
  </div>
</div>
