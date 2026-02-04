import { coreJS } from './modules/core';
import { apiJS } from './modules/api';
import { logicJS } from './modules/logic';
import { uiJS } from './modules/ui';
import { appJS } from './modules/app';

export const js = `
<script>
    ${coreJS}
    ${apiJS}
    ${logicJS}
    ${uiJS}
    ${appJS}
</script>
`;