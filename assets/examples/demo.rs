// Rust demo — parsing an argument vector with pattern matching
use std::env;

fn describe(value: Option<i32>) -> &'static str {
    match value {
        Some(n) if n < 0 => "negative",
        Some(0) => "zero",
        Some(_) => "positive",
        None => "missing",
    }
}

fn main() {
    let args: Vec<String> = env::args().collect();
    let count: i32 = args.len() as i32 - 1;

    println!("args: {}, first is {}", count, describe(Some(count)));

    let total = (0..10).filter(|x| x % 2 == 0).map(|x| x * x).sum::<i32>();
    println!("sum of even squares: {total}");
}