import { Stack, Text, Divider } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

import NavbarAccount from 'src/components/sidebar/NavbarAccount';
import MintingCost from "./MintingCost";
import UserAcceptance from "./UserAcceptance";

type Props = {
    userName: string;
}

export default function ConfirmAndMintCard({ userName }: Props) {

    const { t } = useTranslation();

    return (
        <Stack spacing={4}>
            <Text fontSize={'lg'} >
                {t('minting_page.username_label')} : <b>{userName}</b>
            </Text>
            <MintingCost renderComp={"b"} title={t('labels.cost') + ':'} />
            <Divider />
            <Text as="b">
                {t('minting_page.owneraddress_label')} : <br />
            </Text>
            <NavbarAccount displayAddressMode="full" displaMode="carousel" showFooter={false} />
            <Divider />
            <Stack spacing={1}>
                <UserAcceptance />
            </Stack>
            <Divider />
            <Text as="b" fontSize={'lg'}>
                {t('minting_page.press_bnt_action_label')} : <br />
            </Text>
        </Stack>
    );
}
