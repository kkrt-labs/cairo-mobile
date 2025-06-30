fn fib<let N: u32>() -> Field {
    let mut a: Field = 0;
    let mut b: Field = 1;

    for _ in 0..N {
        let temp = a;
        a = b;
        b = temp + b;
    }

    a
}

fn main() -> pub Field {
    fib::<100000>()
}

#[test]
fn test_main() {
    assert(main() == 0x21c1d7b08f4286f15846c595a455afa690e6f513c662d3a02c58d00ec98fb7be);
}
