const base = async () => {
  let finish = false;
  let l = false;
  let i = false;
  let s = false;
  let z = false;
  let o = false;
  let j = false;
  let t = false;
  while (finish == false) {
    console.log(finish);
    console.log(`l: ${l}`);
    console.log(`i: ${i}`);
    console.log(`s: ${s}`);
    console.log(`z: ${z}`);
    console.log(`o: ${o}`);
    console.log(`j: ${j}`);
    console.log(`t: ${t}`);

    calcStuff();
    if (current == 'i') {
      await right();
      await cw();
      await hd();
      console.log(`${'yes'.green} placed ${current.bold}`);
      i = true;
      await sleep(40);
    }
    calcStuff();
    if (current == 's') {
      if (l) {
        await hd();
        await sleep(40);
        hold(current);
        console.log(`${'yes'.green} placed ${current.bold}`);

        s = true;
      } else {
        console.log(
          `${'hold'.yellow} holding ${current.green} because no ${'L'.blue}`
        );
        await sleep(40);

        continue;
      }
    }
    if (current == 'z') {
      if (j) {
        await das(true);
        await hd();
        console.log(`${'yes'.green} placed ${current.bold}`);
        await sleep(40);
        z = true;
      } else {
        console.log(
          `${'hold'.yellow} holding ${current.green} because no ${'J'.blue}`
        );
        hold(current);

        continue;
      }
    }
    if (current == 't') {
      if (s) {
        await hd();
        console.log(`${'yes'.green} placed ${current.bold}`);

        t = true;
      } else {
        console.log(
          `${'hold'.yellow} holding ${current.green} because no ${'S'.blue}`
        );
        await hold(current);
        await sleep(40);
        continue;
      }
    }
    calcStuff();
    if (current == 'j') {
      await das(true);
      await hd();
      console.log(`${'yes'.green} placed ${current.bold}`);

      j = true;
      await sleep(40);
    } else if (current == 'l') {
      await hd();
      console.log(`${'yes'.green} placed ${current.bold}`);

      l = true;
      await sleep(40);
    } else if (current == 'o') {
      await das(false);
      await hd();
      console.log(`${'yes'.green} placed ${current.bold}`);

      o = true;
      await sleep(40);
    }
    if (i && o && t && z) finish = true;
  }
};
