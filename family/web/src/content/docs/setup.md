# Setting up the glasses

How to get the Purna Lens onto Snap Spectacles, start a session, and link it to Purna Family. Read [Safety](#safety) first.

> **Status:** the Lens is being built in Lens Studio and isn't published in Snap's Lens Explorer yet. Until it is, it's installed as a draft from Lens Studio, as below. These steps follow Snap's developer documentation and will be updated when the Lens ships.

## What you need

- **Snap Spectacles** (the 2024 developer edition or later), charged, and the **Spectacles app** on a phone, with the glasses paired to it. Spectacles are for people 18 and over.
- A computer with **Lens Studio 5** and a Snapchat account to sign in with.
- The Purna project: download or clone [github.com/harshbhx/purna](https://github.com/harshbhx/purna). The repo folder is the Lens Studio project.
- Wi-Fi for the glasses if you want sessions to reach Purna Family. Without it, results still show on the glasses and print to Lens Studio's Logger.

## Install the Lens (once)

1. **Open the project.** Start Lens Studio, sign in, and open the `purna` folder.
2. **Connect the glasses to Lens Studio.** Put the computer and the glasses on the same Wi-Fi network, or plug the glasses into the computer with a USB cable. If they don't connect, toggle *Enable Wired Connectivity* off and on in the Spectacles app (Developer Settings → Lens Development) and restart Lens Studio.
3. **Send the Lens.** In Lens Studio, open the **Preview Lens** menu and choose **Send to Connected Spectacles**. The Lens installs on the glasses that are awake and connected.
4. **Find it on the glasses.** Draft Lenses appear in **Lens Explorer → Drafts**. They are private to your device.

To try Purna without glasses, press **Preview** in Lens Studio instead: right-drag looks around, and a click acts as a pinch.

## Before each session

1. Set up the room as described in [Safety](#safety): seated, a clear table, a carer nearby, no flames.
2. The person sits facing the middle of the table, about an arm's length from its near edge.
3. The carer puts the glasses on the person and opens Purna from Lens Explorer.

## Running a session

1. **Setup panel.** Purna suggests a level and hint delay based on the last sessions; change them if the therapist asked for something else. Leave **Share with family** off unless the family uses Purna Family.
2. Press **Start**. Clay diyas appear across the table. Light the whole ones with a pinch; leave the chipped ones alone. A pinch works from a hand resting in the lap; there's no need to reach.
3. If the person stays on the right, a soft bell rings from the left and a glow appears on the left edge. That's the hint. **Don't point to diyas for them**; the searching is the exercise.
4. After about 90 seconds, or when every whole diya is lit, a glowing thread replays the search and the missed diyas pulse. Then the report card shows four results in plain words.
5. Press **Done**, take the glasses off, and rest.

## Linking to Purna Family (optional)

1. On the setup panel, turn **Share with family** on before Start.
2. At the end, press **Send to family**. The first time, the glasses show a code like `DIYA-7K3P`.
3. On a phone or computer, open [purna.dualmindlab.tech](https://purna.dualmindlab.tech), go to **Have a code from the glasses?**, type the code and the name you call the person, and press **See their practice**. The code works for 72 hours.
4. From then on, sessions from those glasses arrive by themselves. To add brothers, sisters or other carers, use **Invite family** on the dashboard.

## If something goes wrong

| Problem | Try this |
|---|---|
| The glasses don't appear in Lens Studio | Same Wi-Fi on both, or use the USB cable; make sure no other Lens Studio is connected; restart Lens Studio, then the glasses |
| "Couldn't send. Saved to the Logger." | The glasses had no internet. In Lens Studio's Logger, copy the line that starts with `PURNA_SESSION`, then use **Import from Logger** on the dashboard |
| The code says it isn't valid | Codes last 72 hours and work once. Send a new session for a fresh code |
| "Already paired" | These glasses are linked to a family already. Ask them for an invite link |
| Discomfort of any kind | Stop. See [Safety](#safety) |

Sources: [Snap: Testing your Lens on Spectacles](https://developers.snap.com/spectacles/get-started/start-buiding/test-lens-on-spectacles) · [Snap: Connecting Lens Studio to Spectacles](https://developers.snap.com/spectacles/get-started/start-building/connecting-lens-studio-to-spectacles)

Last reviewed: 28 November 2026.
