echo "Building rustport..."
npm unlink -g rustport
bun run build
echo "Linking rustport..."
npm link
echo "Publishing to npm..."
npm publish
echo "Published..."